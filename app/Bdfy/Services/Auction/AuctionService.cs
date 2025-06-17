using BDfy.Data;
using BDfy.Dtos;
using BDfy.Models;
using Microsoft.EntityFrameworkCore;


namespace BDfy.Services
{
    public class AuctionServices(BDfyDbContext db)
    {
        public async Task<bool> EditAuction(Guid auctionId, Guid auctioneerId, EditAuctionDto dto)
        {
            // Len de title < 50
            // Len de desc < 1200
            // Todo lo demas ver si llega null

            var auction = await db.Auctions
                .Include(a => a.Auctioneer)
                .FirstOrDefaultAsync(a => a.Id == auctionId && a.Auctioneer.UserId == auctioneerId)
                ?? throw new InvalidDataException();

            if (auction == null) { return false; }

            if (auction.Status == AuctionStatus.Active) { return false; } // BadRequest

            // Status
            if (dto.Status != null)
            {
                auction.Status = dto.Status.Value;
            }
            // Title
            if (dto.Title != null)
            {
                if (dto.Title.Length > 50) { return false; } // BadRequest
                auction.Title = dto.Title;
            }
            // Description
            if (dto.Description != null)
            {
                if (dto.Description.Length > 1200) { return false; } //BadRequest
                auction.Description = dto.Description;
            }
            // Category
            if (dto.Category is not null)
            {
                auction.Category = dto.Category;
            }
            // StartAt y EndAt
            if (dto.StartAt.HasValue && dto.EndAt.HasValue)
            {
                if (dto.StartAt >= dto.EndAt) { return false; }

                if (dto.StartAt < DateTime.UtcNow.AddMinutes(-5)) { return false; }

                auction.StartAt = dto.StartAt.Value;
                auction.EndAt = dto.EndAt.Value;
            }
            // Direction
            if (dto.Direction != null)
            {
                var dtoDir = dto.Direction;
                var auctDir = auction.Direction;
                if (dtoDir.Street != null) { auctDir.Street = dtoDir.Street; }
                if (dtoDir.StreetNumber != null) { auctDir.StreetNumber = dtoDir.StreetNumber.Value; }
                if (dtoDir.Corner != null) { auctDir.Corner = dtoDir.Corner; }
                if (dtoDir.Department != null) { auctDir.Department = dtoDir.Department; }
                if (dtoDir.ZipCode != null) { auctDir.ZipCode = dtoDir.ZipCode.Value; }
            }

            await db.SaveChangesAsync();
            return true;
        }
    }
}