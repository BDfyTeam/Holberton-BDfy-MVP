using BDfy.Models;
using BDfy.Dtos;
using BDfy.Data;
using BDfy.Hub;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace BDfy.Services
{
    public interface IAutoBidService
    {
        Task<AutoBidConfig> CreateAutoBidAsync(Guid buyerId, Guid lotId, CreateAutoBidDto dto);
        Task<bool> CancelAutoBidAsync(Guid configId, Guid buyerId);
        Task ProcessAutoBidAsync(Guid lotId, decimal newCurrentPrice);
    }

    public class AutoBidService : IAutoBidService
    {
        private readonly IHubContext<BdfyHub, IClient> _hubContext;
        private readonly BidPublisher _bidPublisher;
        private readonly ILogger<AutoBidService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;

        public AutoBidService(IHubContext<BdfyHub, IClient> hubContext, BidPublisher bidPublisher, ILogger<AutoBidService> logger, IServiceScopeFactory scopeFactory)
        {
            _hubContext = hubContext;
            _bidPublisher = bidPublisher;
            _logger = logger;
            _scopeFactory = scopeFactory;
        }
        public async Task<AutoBidConfig> CreateAutoBidAsync(Guid buyerId, Guid lotId, CreateAutoBidDto dto) // tarea para crear un auto bid
        {

            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<BDfyDbContext>();

            var lot = await db.Lots
                .Include(l => l.Auction)
                .FirstOrDefaultAsync(l => l.Id == lotId) ?? throw new ArgumentException("Lot not found");

            var currentPrice = lot.CurrentPrice ?? lot.StartingPrice;
            if (dto.MaxBid <= currentPrice) { throw new InvalidOperationException("Max bid must be higher than current price"); }

            var existing = await db.AutoBidConfigs // Buscamos si hay alguna Auto bid ya establecido para este lote
                .FirstOrDefaultAsync(ab => ab.BuyerId == buyerId && ab.LotId == lotId && ab.IsActive);

            if (existing != null) // Cancelamos la auto bid existente
            {
                existing.IsActive = false;
            }

            var autoBidConfig = new AutoBidConfig // Creamos el auto bid
            {
                BuyerId = buyerId,
                LotId = lotId,
                MaxBid = dto.MaxBid,
                IncreasePrice = dto.IncreasePrice,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.ToLocalTime() // Cambiar (guarda los datos en UTC 0 no en UTC -3)
            };

            db.AutoBidConfigs.Add(autoBidConfig);
            await db.SaveChangesAsync();

            await ProcessAutoBidAsync(lotId, currentPrice); // Llamamos a la tarea que procesa el auto bid para ver si puede ser ya ejecutada 

            return autoBidConfig; // Retorna la nueva autoBid
        }
        public async Task<bool> CancelAutoBidAsync(Guid configId, Guid buyerId) // Funcion para cancelar un AutoBid
        {

            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<BDfyDbContext>();

            var autoBid = await db.AutoBidConfigs
                .FirstOrDefaultAsync(ad => ad.Id == configId && ad.BuyerId == buyerId);

            if (autoBid == null) { return false; }

            autoBid.IsActive = false; // Aca la cancela
            await db.SaveChangesAsync();

            return true;
        }
        public async Task ProcessAutoBidAsync(Guid lotId, decimal newCurrentPrice) // Funcion para procesar las autoBids
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<BDfyDbContext>();

                var activeAutoBids = await db.AutoBidConfigs // Busca todas las auto bids que tiene el lote
                    .Where(ab => ab.LotId == lotId && ab.IsActive)
                    .Include(ab => ab.Buyer)
                    .OrderBy(ab => ab.CreatedAt)
                    .ToListAsync();

                foreach (var autoBid in activeAutoBids)
                {
                    var nextBidAmount = newCurrentPrice + autoBid.IncreasePrice;

                    if (nextBidAmount <= autoBid.MaxBid)
                    {
                        var bid = new SendBidDto // Creamos la bid para ser procesada en RabbitMQ (como una puja normal)
                        {
                            LotId = lotId,
                            Amount = nextBidAmount,
                            BuyerId = autoBid.Buyer.UserId,
                            IsAutoBid = true // Indicamos si la auto-bid es active
                        };

                        await _bidPublisher.Publish(bid); // La manda a la cola de Rabbit

                        newCurrentPrice = nextBidAmount; // Aumentamos el current price para la siguiente autoBid

                        _logger.LogInformation($"Auto-bid placed: ${nextBidAmount} for lot {lotId}");

                        await _hubContext.Clients.Group($"auction_{lotId}")
                            .ReceiveBid(new ReceiveBidDto // Mandamos la nueva puja por SignalR marcandola como autoBid
                            {
                                LotId = lotId,
                                CurrentPrice = nextBidAmount,
                                BuyerId = autoBid.BuyerId,
                                IsAutoBid = true
                            });
                    }
                    else
                    {
                        autoBid.IsActive = false;
                        _logger.LogInformation($"Auto-bid deactivated (max reached): {autoBid.Id}");

                        await _hubContext.Clients.User(autoBid.BuyerId.ToString()) // Le mandamos una notificacion al usuario en especifico de que se paso su maxBid
                            .ReceiveAutoBidDeactivated(new
                            {
                                AutoBidId = autoBid.Id,
                                LotId = lotId,
                                Reason = "Maximum bid reached"
                            });
                    }

                    await db.SaveChangesAsync();
                    
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error processing auto-bids for lot {lotId}");
            }
        }
        
    }
}