using Microsoft.AspNetCore.SignalR;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;
using BDfy.Data;
using BDfy.Dtos;
using BDfy.Models;
using BDfy.Hub;
using Microsoft.EntityFrameworkCore;

namespace BDfy.Services
{
    public class BidConsumerService : BackgroundService // Hereda una clase para runear tareas por atras del programa principal
    {
        private readonly ILogger<BidConsumerService> _logger;
        private readonly IServiceScopeFactory _scopeFactory; // Para crear ambitos, para obtener servicios scoped en un BackgroundService
        private readonly IHubContext<BdfyHub, IClient> _hubContext; // Hub de SignalR

        public BidConsumerService(IServiceScopeFactory scopeFactory, IHubContext<BdfyHub, IClient> hubContext, ILogger<BidConsumerService> logger) // Constructor
        {
            _scopeFactory = scopeFactory;
            _hubContext = hubContext;
            _logger = logger;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken) // El proceso del Consumer
        // Tarea para consumir la bid, guarda los datos en la db y lo manda al hub de SignalR
        // stoppingToken funciona para terminar el servicio en caso de error o de finalizado el uso, de forma limpia y segura
        {
            var factory = new ConnectionFactory // Conexion RabbitMQ
            {
                HostName = "localhost",
                Port = 5672
            };
            IConnection connection = await factory.CreateConnectionAsync(stoppingToken); // El token es para finalizarlo de forma limpia y segura en caso de error
            IChannel channel = await connection.CreateChannelAsync(cancellationToken: stoppingToken); // Lo mismo, por si hay un error

            await channel.QueueDeclareAsync // Inicializa la cola
            (
                queue: "bids", // Nombre de la queue
                durable: true, // Para que no se borre en caso de reinicio del servidor de RabbitMQ
                exclusive: false, // Exclusive sirve para declarar cuantas conexiones pueden usar esta cola (false es para multiples conexiones)
                autoDelete: false, // False hace que la cola no se eliminie despues del ultimo consumidor
                cancellationToken: stoppingToken // Cancela inmediatamente en caso de que se cierre la app
            );
            var consumer = new AsyncEventingBasicConsumer(channel); // Es el que procesa las bids, (instanciando el consumer)

            consumer.ReceivedAsync += async (model, ea) => // Toda la logica de consumer para la bid
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope(); // Creamos el ambito (para obtener la db)
                    var db = scope.ServiceProvider.GetRequiredService<BDfyDbContext>(); // Obtenemos la db
                    
                    var body = ea.Body.ToArray(); // Contiene el mensaje tal cual como se mando
                    var bidDto = JsonSerializer.Deserialize<SendBidDto>(Encoding.UTF8.GetString(body)) ?? throw new InvalidOperationException();
                    // Convierte a el body en un objeto C#

                    using var transaction = await db.Database.BeginTransactionAsync();

                    var updatedRows = await db.Database.ExecuteSqlInterpolatedAsync($@"
                        UPDATE LOTS
                        SET current_price = {bidDto.Amount}
                        WHERE Id = {bidDto.LotId} AND current_price < {bidDto.Amount}
                    "); // Update directo hacia SQL para mejorar escabilidad, velocidad de ejecucion y seguridad

                    if (updatedRows == 0)
                    {
                        _logger.LogInformation("Puja demasiado baja o lote no encontrado: LotId: {LotId}, Amount: {Amount}", bidDto.LotId, bidDto.Amount);
                        return;
                    }

                    var userDetails = await db.UserDetails // Se rompe al realizar unaa accion con la DB
                        .FirstOrDefaultAsync(ud => ud.UserId == bidDto.BuyerId) ?? throw new InvalidOperationException();

                    var bid = new Bid // Creamos nueva bid para la BiddingHistory y la db
                    {
                        Amount = bidDto.Amount,
                        Time = DateTime.UtcNow,
                        LotId = bidDto.LotId,
                        BuyerId = userDetails.Id,
                        IsAutoBid = bidDto.IsAutoBid
                    };

                    db.Bids.Add(bid);
                    await db.SaveChangesAsync(); // Esperamos a que se guarden los cambios en la db

                    var lot = await db.Lots // Instanciamos el lote para poder asignar la nueva oferta a la BiddingHistory
                    .Include(l => l.BiddingHistory)
                    .FirstOrDefaultAsync(l => l.Id == bidDto.LotId);

                    if (lot is not null)
                    {
                        lot.BiddingHistory ??= new List<Bid>();
                        lot.BiddingHistory.Add(bid);
                        await db.SaveChangesAsync();
                    }
                    await transaction.CommitAsync();

                    await _hubContext.Clients.Group($"auction_{bid.LotId}").ReceiveBid(
                        new ReceiveBidDto // Creamos la bid que se mandara al hub
                        {
                            LotId = bid.LotId,
                            CurrentPrice = bid.Amount,
                            BuyerId = bid.BuyerId,
                            Timestamp = DateTime.UtcNow
                        }
                    ); // Le mandamos la Bid a todo los clientes del grupo by lotId
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error al procesar puja");
                }
            };
            await channel.BasicConsumeAsync // BasicConsumeAsync es para consumir la puja (es como que ejecuta todo lo de arriba)
            (
                queue: "bids", // Especifia la cola de donde Consumir las pujas
                autoAck: true, // Es para marcar que la puja fue procesada, en true es mas rapido pero riesgoso de perder la puja en caso de error de alguna cosa
                consumer: consumer, // El consumidor con toda la logica de consumer
                cancellationToken: stoppingToken // Cancela rapidamente en caso de que la app se cierre
            );

            while (!stoppingToken.IsCancellationRequested) // Mantiene el servicio activo hasta que se solicite la cancelacion
            {
                await Task.Delay(1000, stoppingToken); // Mantiene el servicio vivo
            }
        }
    }
}