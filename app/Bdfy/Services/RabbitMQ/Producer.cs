using RabbitMQ.Client;
using BDfy.Dtos;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace BDfy.Services
{
    public class BidPublisher // Funcion para publicar la bid a RabbitMQ
    {
        private IChannel? _channel; // Puede ser null pq despues lo manejas
        private IConnection? _connection; // Puede ser null pq despues lo manejas
        private readonly ILogger<BidPublisher> _logger;
        private readonly IConfiguration _configuration;

        public BidPublisher(ILogger<BidPublisher> logger, IConfiguration configuration)
        {
            _logger = logger; // Informacion de la conexion (testing)
            _configuration = configuration;
        }
        public async Task InitializeAsync() // Tarea para inicializar la conexion, el canal y la queue
        {
            
            var hostName = _configuration["RabbitMQ:HostName"] ?? throw new InvalidOperationException("RabbitMQ HostName is not configured");
            var userName = _configuration["RabbitMQ:UserName"] ?? throw new InvalidOperationException("RabbitMQ UserName is not configured");
            var password = _configuration["RabbitMQ:Password"] ?? throw new InvalidOperationException("RabbitMQ Password is not configured");

            var factory = new ConnectionFactory // Seteamos los datos para la conexion
            {
                HostName = hostName,
                UserName = userName,
                Password = password,
                Port = 5672
            };
            _connection = await factory.CreateConnectionAsync(); // Creamos la conexion
            _channel = await _connection.CreateChannelAsync(); // Creamos el canal dentro de la conexion
            await _channel.QueueDeclareAsync
            (
                queue: "bids", // Key de la queue
                durable: true, // Para que no se borre en caso de reinicio del servidor de RabbitMQ
                exclusive: false, // Exclusive sirve para declarar cuantas conexiones pueden usar esta cola (false es para multiples conexiones)
                autoDelete: false // False hace que la cola no se eliminie despues del ultimo consumidor
            );
        }

        public async Task Publish(SendBidDto bid) // Creamos el producer
        {
            if (_channel == null) // Validacion
            {
                throw new InvalidOperationException("Channel not initialized. Call InitializeAsync first.");// Manejo de errores
            }

            var props = new BasicProperties(); // Propiedades basicas para mandar al canal (solucion para propiedades en null)

            var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(bid)); // Pasamos el mensaje a bytes (Json a bytes)
            await _channel.BasicPublishAsync( // Creamos el producer
                exchange: "", // Default Exchange o Non-Exchange o sea que ira a la cola que tenga la misma key route
                routingKey: "bids", // La Key para la ruta
                mandatory: false, // Seteas que la bid si o si tenga que ir a una cola
                basicProperties: props, // Propiedades en default
                body: body // La puja en bytes
            );
        }
        public void Dispose() // Por si alguno es null la liberamos
        {
            _connection?.Dispose();
            _channel?.Dispose();
        }
    }
}