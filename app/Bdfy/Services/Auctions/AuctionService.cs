using BDfy.Data;
using BDfy.Dtos;
using BDfy.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BDfy.Services
{
    public class AuctionServices(BDfyDbContext db, GcsImageService imageService)
    {
        private GcsImageService _imgService = imageService;

        public async Task<Auction> CreateAuction(Guid userId, RegisterAuctionDto Dto)
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

            return auction;
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

        public async Task<IEnumerable<AuctionDtoId>> GetAuctionsByAuctioneerId(Guid auctioneerId)
        {

            var auctioneer = await db.Users.FirstOrDefaultAsync(u => u.Id == auctioneerId) ?? throw new NotFoundException("Error: Auctioneer not found");

            var auctions = await db.Auctions
                    .Include(a => a.Auctioneer)
                    .Include(a => a.AuctionLots)
                        .ThenInclude(al => al.Lot)
                    .Where(a => a.Auctioneer.UserId == auctioneer.Id)
                    .ToListAsync();
            var tz = TimeZoneInfo.FindSystemTimeZoneById("Montevideo Standard Time");

            var auctionsDto = auctions.Select(a => new AuctionDtoId
            {
                Id = a.Id,
                Title = a.Title,
                ImageUrl = a.ImageUrl,
                Description = a.Description,
                StartAt = TimeZoneInfo.ConvertTimeFromUtc(a.StartAt, tz),
                EndAt = TimeZoneInfo.ConvertTimeFromUtc(a.EndAt, tz),
                Category = a.Category,
                Status = a.Status,
                Direction = a.Direction,
                AuctioneerId = a.Auctioneer.UserId,
                Lots = a.AuctionLots
                .Select(al => new LotGetDto
                {
                    Id = al.LotId,
                    Title = al.Lot.Title,
                    ImageUrl = al.Lot.ImageUrl,
                    StartingPrice = al.Lot.StartingPrice,
                    CurrentPrice = al.Lot.CurrentPrice ?? al.Lot.StartingPrice,
                    Description = al.Lot.Description,
                    Details = al.Lot.Details,
                    AuctionId = al.AuctionId,
                    LotNumber = al.Lot.LotNumber,
                    Sold = al.Lot.Sold,
                    EndingPrice = al.Lot.EndingPrice ?? 0,
                    WinnerId = al.Lot.WinnerId
                }).ToList()
            });

            return auctionsDto;
        }

        public async Task<IEnumerable<AuctionDto>> GetAucionByStatus(string status)
        {
            if (!Enum.TryParse(status, true, out AuctionStatus enumStatus)) // Convertimos el string a enum
            {
                throw new BadRequestException($"Invalid status: {status}");
            }

            var auctions = await db.Auctions
                    .Include(ad => ad.Auctioneer)
                    .Include(a => a.AuctionLots)
                    .Where(a => a.Status == enumStatus)
                    .ToListAsync();

            if (enumStatus == AuctionStatus.Storage)
            {
                throw new UnauthorizedException("Access Denied");
            }

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
                Auctioneer = a.Auctioneer is not null
                    ? new AuctioneerDto
                    {
                        UserId = a.Auctioneer.UserId,
                        Plate = a.Auctioneer.Plate,
                        AuctionHouse = a.Auctioneer.AuctionHouse
                    }
                    : new AuctioneerDto
                    {
                        UserId = Guid.Empty,
                        Plate = 0,
                        AuctionHouse = ""
                    }
            }).ToList();
            return auctionDtos;
        }

        public async Task<AuctionDto> GetAuctionById(Guid auctionId)
        {
            var auctionById = await db.Auctions
                        .Include(ad => ad.Auctioneer)
                        .Include(a => a.AuctionLots)
                            .ThenInclude(al => al.Lot)
                        .FirstOrDefaultAsync(a => a.Id == auctionId) ?? throw new NotFoundException("Auction not found");

            var tz = TimeZoneInfo.FindSystemTimeZoneById("Montevideo Standard Time");

            var auctionDto = new AuctionDto
            {
                Id = auctionById.Id,
                Title = auctionById.Title,
                ImageUrl = auctionById.ImageUrl,
                Description = auctionById.Description,
                StartAt = TimeZoneInfo.ConvertTimeFromUtc(auctionById.StartAt, tz),
                EndAt = TimeZoneInfo.ConvertTimeFromUtc(auctionById.EndAt, tz),
                Category = auctionById.Category ?? [],
                Status = auctionById.Status,
                Direction = auctionById.Direction,
                AuctioneerId = auctionById.AuctioneerId,
                Lots = auctionById.AuctionLots.Where(al => al.IsOriginalAuction).Select(al => new LotsDto
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
                    UserId = auctionById.Auctioneer.UserId,
                    Plate = auctionById.Auctioneer.Plate,
                    AuctionHouse = auctionById.Auctioneer.AuctionHouse
                }
            };

            return auctionDto;
        }

        public async Task<IEnumerable<LotsDto>> GetStorageById(Guid auctioneerId, string status)
        {
            if (!Enum.TryParse(status, true, out AuctionStatus enumStatus)) // Convertimos el string a enum
            {
                throw new BadRequestException($"Invalid status: {status}");
            }

            if (enumStatus != AuctionStatus.Storage)
            {
                throw new BadRequestException("Access Denied: This route is only for Storage");
            }

            var auctioneer = await db.Users
                    .Include(u => u.AuctioneerDetails)
                    .FirstOrDefaultAsync(u => u.Id == auctioneerId) ?? throw new NotFoundException("Auctioneer not found");

            var lotsInStorage = await db.AuctionLots
                    .Include(al => al.Lot)
                    .Include(al => al.Auction)
                        .ThenInclude(a => a.Auctioneer)
                    .Where(al =>
                        al.Auction.Status == AuctionStatus.Storage &&
                        al.Auction.AuctioneerId == auctioneerId
                        && al.Lot.Sold == false
                    )
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
                    }).ToListAsync();

            return lotsInStorage;
        }

        public async Task<IEnumerable<AuctionDto>> GetCategoryByNumber(int Category)
        {
            var auctionByCategory = await db.Auctions
                    .Include(a => a.AuctionLots)
                        .ThenInclude(al => al.Lot)
                    .Include(a => a.Auctioneer)
                    .Where(a => a.Category != null && a.Category.Contains(Category) && a.Status != AuctionStatus.Storage)
                    .ToListAsync() ?? throw new BadRequestException($"No auctions for this category {Category}");

            var tz = TimeZoneInfo.FindSystemTimeZoneById("Montevideo Standard Time");


            var auctionsDto = auctionByCategory.Select(a => new AuctionDto
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
                Lots = a.AuctionLots.Where(al => al.IsOriginalAuction).Select(al => new LotsDto
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

            });

            return auctionsDto;
        }

        public async Task EditAuction(Guid auctionId, Guid auctioneerId, EditAuctionDto dto)
        {
            var auction = (await db.Auctions
                .Include(a => a.Auctioneer)
                .FirstOrDefaultAsync(a => a.Id == auctionId && a.Auctioneer.UserId == auctioneerId)
                ?? throw new InvalidDataException()) ?? throw new NotFoundException("Auction not found");

            if (auction.Status == AuctionStatus.Active) { throw new BadRequestException("Cannot edit active auctions"); } // BadRequest

            // Status
            if (dto.Status != null)
            {
                auction.Status = dto.Status.Value;
            }
            // Title
            if (dto.Title != null)
            {
                if (dto.Title.Length > 50) { throw new BadRequestException("The title cannot have more than 50 characters"); } // BadRequest
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
                if (dto.Description.Length > 1200) { throw new BadRequestException("The description cannot have more than 1200 characters"); } //BadRequest
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
                if (dto.StartAt >= dto.EndAt) { throw new BadRequestException("Start date cannot be greater than or equal to the end date"); }

                if (dto.StartAt < DateTime.UtcNow.AddMinutes(-5)) { throw new BadRequestException("Start date cannot be in the past"); }

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
        }

        public async Task DeleteAuctionById(Guid auctionId, Guid auctioneerId)
        {
            using var transaction = await db.Database.BeginTransactionAsync();
            
            var auction = await db.Auctions
                    .Include(a => a.AuctionLots)
                    .FirstOrDefaultAsync(a => a.Id == auctionId && a.Auctioneer.UserId == auctioneerId) ?? throw new NotFoundException("Required information not found");

            if (auction.Status != AuctionStatus.Draft) { throw new BadRequestException("Auction can only be deleted if it is in draft status"); }

                if (!string.IsNullOrEmpty(auction.ImageUrl))
				{
					try
					{
						await _imgService.DeleteImageAsync(auction.ImageUrl);
					}
					catch (Exception ex)
					{
						Console.WriteLine($"Error al borrar la imagen: {ex.Message}");
					}
				}

                var auctionLotsToDelete = await db.AuctionLots
                    .Where(al => al.AuctionId == auctionId && al.IsOriginalAuction)
                    .ToListAsync();

                var lotIds = auctionLotsToDelete.Select(al => al.LotId).ToList();

                db.AuctionLots.RemoveRange(auctionLotsToDelete);

                var storage = await db.Auctions
                    .Include(a => a.Auctioneer)
                    .FirstOrDefaultAsync(a => a.Auctioneer.UserId == auctioneerId && a.Status == AuctionStatus.Storage);

                if (storage != null)
                {
                    foreach (var lotId in lotIds)
                    { 
                        bool isMissing = !db.AuctionLots.Local.Any(al => al.LotId == lotId);

                        if (isMissing)
                        {
                            var newAuctionLot = new AuctionLot
                            {
                                AuctionId = storage.Id,
                                LotId = lotId,
                                IsOriginalAuction = false,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            };

                            db.AuctionLots.Add(newAuctionLot);
                        }
                    }
                }

                await db.SaveChangesAsync();

                db.Auctions.Remove(auction);
                await db.SaveChangesAsync();
                await transaction.CommitAsync();
        }

    }
}