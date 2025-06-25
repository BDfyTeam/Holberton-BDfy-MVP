using BDfy.Models;
using BDfy.Data;
using Microsoft.EntityFrameworkCore;

namespace BDfy.Services
{
    public class AuctionCloserService(IServiceScopeFactory scopeFactory, ILogger<AuctionCloserService> logger) : BackgroundService // Heredamos de la clase BackgroundService para poder hacer tareas en segundo plano
    {
        private readonly IServiceScopeFactory _scopeFactory = scopeFactory; // Servicio para hacer scopes ("Pedir cosas del proceso principal")
        private readonly ILogger<AuctionCloserService> _logger = logger;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _scopeFactory.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<BDfyDbContext>(); // Obtenemos la DB a traves de un Scope

                var auctionLotsToClose = await dbContext.AuctionLots // Buscamos las Subastas activas y que su EndAt sea menor o igual que el actual
                    .Include(al => al.Auction) // Incluimos las subastas de la tabla intermedia
                        .ThenInclude(a => a.Auctioneer) // El subsatador de la subasta
                    .Include(al => al.Lot) // Los lotes de la tabla intermedia
                        .ThenInclude(l => l.BiddingHistory) // Historial
                            .ThenInclude(b => b.Buyer) // Comprador
                    .Where(al => al.Auction.Status == AuctionStatus.Active && al.Auction.EndAt <= DateTime.UtcNow) // Buscamos dentro de la tabla intermedia las subastas activas que se hayan terminado
                    .AsSplitQuery() // Rendimiento
                    .ToListAsync(cancellationToken: stoppingToken);

                var groupedAuctions = auctionLotsToClose.GroupBy(al => al.AuctionId); // Agrupamos todas las subastas por su auction id

                foreach (var auctionGroup in groupedAuctions) // Iteramos sobre las subastas
                {
                    var auctionId = auctionGroup.Key;
                    var auction = auctionGroup.First().Auction;

                    foreach (var al in auctionGroup) // Iteramos sobre los lotes de una subasta ---> al == subasta
                    {
                        var lot = al.Lot;

                        if (lot.BiddingHistory != null && lot.BiddingHistory.Any())
                        {
                            var winner = lot.BiddingHistory
                                .OrderByDescending(b => b.Amount)
                                .First();

                            lot.Sold = true;
                            lot.Winner = winner.Buyer;
                            lot.WinnerId = winner.BuyerId;
                            lot.EndingPrice = lot.CurrentPrice;

                            _logger.LogInformation("Lote {LotId} vendido a {WinnerBuyerId} por {LotCurrentPrice}.", lot.Id, winner.BuyerId, lot.CurrentPrice);
                        }
                        else
                        {
                            lot.Sold = false;
                            lot.EndingPrice = lot.CurrentPrice;

                            if (auction.Auctioneer == null)
                            {
                                _logger.LogWarning("Skipping lot {LotId} because its Auction or Aucrtioneer is null.", lot.Id);
                                continue;
                            }

                            var auctioneerUserId = auction.Auctioneer.UserId;

                            var storageAuction = await dbContext.Auctions
                                .Include(a => a.Auctioneer)
                                .FirstOrDefaultAsync(a =>
                                    a.Status == AuctionStatus.Storage &&
                                    a.Auctioneer.UserId == auctioneerUserId, cancellationToken: stoppingToken)
                                    ?? throw new InvalidOperationException("No storage auction found for the auctioneer."
                                );

                            dbContext.AuctionLots.Add(new AuctionLot // Creamos una nueva instancia en la tabla donde guardaremos el lote al storage (indicando que no es su subasta original)
                            {
                                AuctionId = storageAuction.Id,
                                LotId = lot.Id,
                                IsOriginalAuction = false
                            });

                            _logger.LogInformation("Lote {LotId} movido a Storage.", lot.Id);

                        }
                    }
                    _logger.LogInformation("Closed auction {AuctionId}", auction.Id);
                    auction.Status = AuctionStatus.Closed;
                    await dbContext.SaveChangesAsync(stoppingToken);
                }
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }
    }
}
