using BDfy.Data;
using BDfy.Dtos;
using BDfy.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDfy.Services
{
    public class AuctionServices(BDfyDbContext db, GcsImageService imageService)
    {
        private GcsImageService _imgService = imageService;

        public async Task CreateAuction(Guid userId, RegisterAuctionDto Dto)
        {
            var startAtUtc = Dto.StartAt.UtcDateTime;
            var endAtUtc = Dto.EndAt.UtcDateTime;
            
            if (startAtUtc >= endAtUtc) { throw new BadRequestException("Start date must be before end date"); }

            if (startAtUtc < DateTime.UtcNow.AddMinutes(-5)) { throw new BadRequestException("Start date cannot be in the past"); }

            var auctioneer = await db.Users
                .Include(u => u.AuctioneerDetails)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (auctioneer == null || auctioneer.AuctioneerDetails == null) { throw new NotFoundException("User not found"); }

            if (Dto.Category == null || Dto.Category.Length == 0)
            {
                Dto.Category = [99];
            }

            if (Dto.Image == null || Dto.Image.Length == 0) { throw new BadRequestException("The auction must contain an image"); }
            var urlImage = await _imgService.UploadImageAsync(Dto.Image, "auctions");

            var auction = new Auction
            {
                Title = Dto.Title,
                Description = Dto.Description,
                StartAt = startAtUtc,
                EndAt = endAtUtc,
                Category = Dto.Category,
                Status = Dto.Status,
                ImageUrl = urlImage,
                Direction = Dto.Direction,
                AuctioneerId = auctioneer.AuctioneerDetails.UserId,
                Auctioneer = auctioneer.AuctioneerDetails
            };

            db.Auctions.Add(auction);
            await db.SaveChangesAsync();
        }

        public async Task<ActionResult<IEnumerable<AuctionDto>>> AllAuctions()
        {
            var auctions = await db.Auctions
                .Include(ad => ad.Auctioneer)
                .Include(a => a.AuctionLots)
                    .ThenInclude(al => al.Lot)
                .Where(a => a.Status != AuctionStatus.Storage)
                .ToListAsync();
            var tz = TimeZoneInfo.FindSystemTimeZoneById("Montevideo Standard Time");

            var auctionDtos = auctions.Select(a => new AuctionDto
            {
                Id = a.Id,
                Title = a.Title,
                ImageUrl = a.ImageUrl,
                Description = a.Description,
                StartAt = TimeZoneInfo.ConvertTimeFromUtc(a.StartAt, tz),
                EndAt = TimeZoneInfo.ConvertTimeFromUtc(a.EndAt, tz),
                Category = a.Category ?? [],
                Status = a.Status,
                Direction = a.Direction,
                AuctioneerId = a.AuctioneerId,
                Lots = a.AuctionLots
                .Select(al => new LotsDto
                {
                    Id = al.LotId,
                    Title = al.Lot.Title,
                    ImageUrl = al.Lot.ImageUrl,
                    LotNumber = al.Lot.LotNumber,
                    Description = al.Lot.Description,
                    Details = al.Lot.Details,
                    AuctionId = al.AuctionId,
                    StartingPrice = al.Lot.StartingPrice,
                    CurrentPrice = al.Lot.CurrentPrice ?? al.Lot.StartingPrice,
                    EndingPrice = al.Lot.EndingPrice ?? 0,
                    Sold = al.Lot.Sold

                }).ToList() ?? new List<LotsDto>(),
                Auctioneer = new AuctioneerDto
                {
                    UserId = a.Auctioneer.UserId,
                    Plate = a.Auctioneer.Plate,
                    AuctionHouse = a.Auctioneer.AuctionHouse
                }
            }).ToList();

            return auctionDtos;
        }

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
            // Image
            if (dto.Image != null && dto.Image.Length > 0)
            {
                if (auction.ImageUrl != null)
                {
                    var newHash = await _imgService.CalculateHashAsync(dto.Image.OpenReadStream()); // Calcula hash de la nueva imagen
                    var oldStream = await _imgService.DownloadImageAsync(auction.ImageUrl); // Descarga la imagen de la subasta
                    var oldHash = await _imgService.CalculateHashAsync(oldStream); // Calcula hash de la imagen de la subasta

                    if (newHash != oldHash) // Compara hashs ---> si son diferentes significa que es otra imagen
                    {
                        await _imgService.DeleteImageAsync(auction.ImageUrl); // Borra la anituga foto
                        auction.ImageUrl = await _imgService.UploadImageAsync(dto.Image, "auctions"); // Actualiza a la nueva imagen
                    }
                }
                else
                {
                    auction.ImageUrl = await _imgService.UploadImageAsync(dto.Image, "auctions"); // Si la subasta no tenia imagen sube la neuva foto
                }
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