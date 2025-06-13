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

                var auctionsToClose = await dbContext.Auctions // Buscamos las Subastas activas y que su EndAt sea menor o igual que el actual
                    .Include(a => a.Auctioneer)
                    .Include(a => a.Lots)
                        .ThenInclude(l => l.BiddingHistory)
                            .ThenInclude(b => b.Buyer)
                    .AsSplitQuery()
                    .Where(a => a.Status == AuctionStatus.Active && a.EndAt <= DateTime.UtcNow)
                    .ToListAsync(cancellationToken: stoppingToken);

                foreach (var auction in auctionsToClose)
                {
                    foreach (var lot in auction.Lots)
                    {
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
                                    .ThenInclude(ad => ad.User)
                                .FirstOrDefaultAsync(a => a.Status == AuctionStatus.Storage &&
                                a.Auctioneer.UserId == auctioneerUserId, cancellationToken: stoppingToken)
                                ?? throw new InvalidOperationException("No storage auction found for the auctioneer.");

                            lot.Auction = storageAuction;
                            lot.AuctionId = storageAuction.Id;

                            _logger.LogInformation("Lote {LotId} movido a Storage.", lot.Id);

                        }
                    }
                    _logger.LogInformation("Closed auction {AuctionId} with {AuctionLotsCount} lots.", auction.Id, auction.Lots.Count);
                    auction.Status = AuctionStatus.Closed;
                }

                await dbContext.SaveChangesAsync(stoppingToken);
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }
    }
}
