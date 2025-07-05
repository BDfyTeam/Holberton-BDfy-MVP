using System.Data.Common;
using BDfy.Models;
using BDfy.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http.HttpResults;

namespace BDfy.Services
{
    public class Storage
    {

        protected readonly BDfyDbContext _db;

        public Storage(BDfyDbContext db)
        {
            _db = db ?? throw new Exception("Nada");
        }

        public async Task<Auction> CreateStorage(Guid auctioneerId)
        {

            var auctioneer = await _db.Users
                .Include(u => u.AuctioneerDetails)
                .FirstOrDefaultAsync(u => u.Id == auctioneerId) ?? throw new Exception("User not found. Sorry");
            if (auctioneer.AuctioneerDetails == null) { throw new Exception("Auctioneer Details not found"); }

            var Storage = new Auction
            {
                Title = "Storage",
                ImageUrl = "storage.png",
                Description = "No Description",
                StartAt = DateTime.UtcNow,
                EndAt = DateTime.UtcNow,
                Category = [],
                Status = AuctionStatus.Storage,
                Direction = new Direction { },
                AuctioneerId = auctioneerId,
                Auctioneer = auctioneer.AuctioneerDetails
            };

            return Storage;
        }
        public async Task<Auction> GetStorage(Guid auctioneerId)
        {
            var auction = await _db.Auctions
                .Include(a => a.Auctioneer)
                .FirstOrDefaultAsync(a => a.AuctioneerId == auctioneerId && a.Status == AuctionStatus.Storage);

            if (auction == null)
            {
                throw new Exception("Storage not found for this auctioneer.");
            }

            return auction;
        }
        public async Task<bool> DeleteStorage(Guid auctioneerId)
        {
            var auction = await _db.Auctions
                .FirstOrDefaultAsync(a => a.AuctioneerId == auctioneerId && a.Status == AuctionStatus.Storage);

            if (auction == null)
            {
                throw new Exception("Storage not found for this auctioneer.");
            }

            _db.Auctions.Remove(auction);
            return await _db.SaveChangesAsync() > 0;
        }
    }
}