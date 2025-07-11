using BDfy.Data;
using BDfy.Models;
using BDfy.Dtos;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption.ConfigurationModel;
using System.Diagnostics;

namespace BDfy.Services
{
    public class LotService(BDfyDbContext db, GcsImageService imageService, BidPublisher _bidPublisher, IAutoBidService _autoBidService)
    {
        public async Task<Lot> Register(RegisterLot Dto, Guid auctionId, Guid userId)
        {
            var auction = await db.Auctions
                .Include(a => a.Auctioneer)
                .FirstOrDefaultAsync(a => a.Id == auctionId && a.Auctioneer.UserId == userId) ?? throw new NotFoundException("Auction not found");

            if (auction.Status == AuctionStatus.Active || auction.Status == AuctionStatus.Closed)
            {
                throw new BadRequestException("Lot registration is only permitted for draft auctions or the auctioneer Storage");
            }

            if (auction.Auctioneer.UserId != userId) { throw new UnauthorizedException("Access Denied: Diffrent User as the login"); }

            var checkLot = await db.AuctionLots // Busco en la tabla intermedia por algun lote que cumpla las caracteristicas
                .Include(al => al.Lot)
                .AnyAsync(al => al.Lot.LotNumber == Dto.LotNumber && al.AuctionId == auctionId && al.IsOriginalAuction);

            if (checkLot) { throw new BadRequestException($"Lot number {Dto.LotNumber} already exists"); }

            if (Dto.Image == null || Dto.Image.Length == 0) { throw new BadRequestException("The lot must contain an image"); }

            var urlImage = await imageService.UploadImageAsync(Dto.Image, "lots");

            var lot = new Lot // Creamos el lote
            {
                Title = Dto.Title,
                LotNumber = Dto.LotNumber,
                Description = Dto.Description,
                Details = Dto.Details,
                ImageUrl = urlImage,
                StartingPrice = Dto.StartingPrice,
                CurrentPrice = Dto.StartingPrice,
                Sold = false
            };
            db.Lots.Add(lot);
            await db.SaveChangesAsync();

            var auctionLot = new AuctionLot // Tabla de relacion intermedia de auction <-> lot
            {
                AuctionId = auctionId,
                LotId = lot.Id,
                IsOriginalAuction = true // Cuando se crea un lote su primer auction es el original
            };

            db.AuctionLots.Add(auctionLot);
            await db.SaveChangesAsync();

            return lot;
        }

        public async Task<IEnumerable<GetLotByIdDto>> GetLotByAuctioneerId(Guid auctioneer_id)
        {
            var lots = await db.AuctionLots
                    .Where(al => al.Auction.Auctioneer.UserId == auctioneer_id)
                    .Include(al => al.Lot)
                    .Include(al => al.Auction)
                        .ThenInclude(a => a.Auctioneer)
                    .Select(al => new GetLotByIdDto
                    {
                        Id = al.Lot.Id,
                        Title = al.Lot.Title,
                        LotNumber = al.Lot.LotNumber,
                        Description = al.Lot.Description,
                        Details = al.Lot.Details,
                        ImageUrl = al.Lot.ImageUrl,
                        StartingPrice = al.Lot.StartingPrice,
                        CurrentPrice = al.Lot.CurrentPrice ?? al.Lot.StartingPrice,
                        EndingPrice = al.Lot.EndingPrice ?? 0,
                        Sold = al.Lot.Sold,
                        Auction = new LotByIdAuctionDto
                        {
                            Id = al.Auction.Id,
                            Title = al.Auction.Title,
                            Description = al.Auction.Description,
                            StartAt = al.Auction.StartAt,
                            EndAt = al.Auction.EndAt,
                            Category = al.Auction.Category,
                            ImageUrl = al.Auction.ImageUrl,
                            Status = al.Auction.Status,
                            AuctioneerId = al.Auction.AuctioneerId,
                            Auctioneer = new AuctioneerDto
                            {
                                UserId = al.Auction.Auctioneer.UserId,
                                Plate = al.Auction.Auctioneer.Plate,
                                AuctionHouse = al.Auction.Auctioneer.AuctionHouse
                            }
                        }
                    })
                    .ToListAsync();
            if (lots == null || lots.Count == 0)
            {
                throw new NotFoundException("No lots found for this auctioneer.");
            }
            return lots;
        }
        public async Task<GetLotByIdDto> GetLotById(Guid lotId)
        {
            var auctionLotById = await db.AuctionLots
                .Include(al => al.Auction)
                    .ThenInclude(a => a.Auctioneer)
                .Include(al => al.Lot)
                .FirstOrDefaultAsync(al => al.IsOriginalAuction && al.LotId == lotId) ?? throw new NotFoundException("AuctionLot not found. Sorry");
            if (auctionLotById.Auction == null) { throw new NotFoundException("Auction not found. Sorry"); }

            if (auctionLotById.Lot == null) { throw new NotFoundException("Lot not found. Sorry"); }

            var lot = new GetLotByIdDto
            {
                Id = auctionLotById.LotId,
                Title = auctionLotById.Lot.Title,
                ImageUrl = auctionLotById.Lot.ImageUrl,
                LotNumber = auctionLotById.Lot.LotNumber,
                Description = auctionLotById.Lot.Description,
                Details = auctionLotById.Lot.Details,
                StartingPrice = auctionLotById.Lot.StartingPrice,
                CurrentPrice = auctionLotById.Lot.CurrentPrice ?? auctionLotById.Lot.StartingPrice,
                EndingPrice = auctionLotById.Lot.EndingPrice ?? 0,
                Sold = auctionLotById.Lot.Sold,
                Auction = new LotByIdAuctionDto
                {
                    Id = auctionLotById.Auction.Id,
                    Title = auctionLotById.Auction.Title,
                    ImageUrl = auctionLotById.Auction.ImageUrl,
                    Description = auctionLotById.Auction.Description,
                    StartAt = auctionLotById.Auction.StartAt,
                    EndAt = auctionLotById.Auction.EndAt,
                    Category = auctionLotById.Auction.Category,
                    Status = auctionLotById.Auction.Status,
                    WinnerId = auctionLotById.Lot.Winner?.Id ?? Guid.Empty,
                    AuctioneerId = auctionLotById.Auction.AuctioneerId,
                    Auctioneer = new AuctioneerDto
                    {
                        UserId = auctionLotById.Auction.Auctioneer.UserId,
                        Plate = auctionLotById.Auction.Auctioneer.Plate,
                        AuctionHouse = auctionLotById.Auction.Auctioneer.AuctionHouse
                    }
                }
            };
            return lot;
        }
        public async Task<IEnumerable<LotGetDto>> GetAllLots()
        {
            var auctionLots = await db.AuctionLots
                .Include(al => al.Auction)
                .Include(al => al.Lot)
                .ToListAsync();

            var lotsDto = auctionLots.Select(al => new LotGetDto
            {
                Id = al.LotId,
                Title = al.Lot.Title,
                ImageUrl = al.Lot.ImageUrl,
                LotNumber = al.Lot.LotNumber,
                Description = al.Lot.Description,
                Details = al.Lot.Details,
                StartingPrice = al.Lot.StartingPrice,
                CurrentPrice = al.Lot.CurrentPrice ?? al.Lot.StartingPrice,
                EndingPrice = al.Lot.EndingPrice ?? 0,
                Sold = al.Lot.Sold,
                AuctionId = al.AuctionId,
                WinnerId = al.Lot.WinnerId ?? Guid.Empty
            });

            return lotsDto;
        }
        public async Task PostBid(BidDto bid, Guid lotId, Guid userId)
        {
            var AuctionLot = await db.AuctionLots // Obtenemos solo lo que precisamos para comparar
                .Where(al => al.LotId == lotId && al.IsOriginalAuction && al.Auction.Status == AuctionStatus.Active)
                .OrderByDescending(al => al.Auction.StartAt)
                .Select(al => new
                {
                    al.LotId,
                    AuctioneerId = al.Auction.Auctioneer.UserId,
                    AuctionStatus = al.Auction.Status,
                    AuctionEndAt = al.Auction.EndAt,
                    LotCurrentPrice = al.Lot.CurrentPrice,
                    LotStartingPrice = al.Lot.StartingPrice,
                    LotSold = al.Lot.Sold
                })
                .FirstOrDefaultAsync() ?? throw new NotFoundException("Lot not found");

            if (AuctionLot.AuctioneerId == userId) { throw new ForBidException("Access Denied: You cannot bid in your own Lot"); }

            if (AuctionLot.AuctionStatus != AuctionStatus.Active) { throw new BadRequestException("Cannot bid on inactive auction"); }

            if (AuctionLot.LotSold) { throw new BadRequestException("Lot has already been sold"); }

            var minimumBid = AuctionLot.LotCurrentPrice ?? AuctionLot.LotStartingPrice;

            if (bid.Amount <= minimumBid)
            {
                throw new BadRequestException($"Bid amount must be greater than current price: {minimumBid}");
            }

            var dto = new SendBidDto
            {
                LotId = lotId,
                Amount = bid.Amount,
                BuyerId = userId,
                IsAutoBid = false
            };
            await _bidPublisher.Publish(dto);

            var autoBidService = _autoBidService;
            _ = Task.Run(async () => // Despues de procesarse una bid manual mandamos el lote para verificar si hay alguna auto bid para realizar en ese lote
            {
                await Task.Delay(500);
                await autoBidService.ProcessAutoBidAsync(lotId, bid.Amount);
            });
        }
        public async Task<(int, Stopwatch)> StressTest(Guid lotId, Guid buyerId)
        {
            int cantidadDePujas = 100000;
            var tasks = new List<Task>();
            var stopwatch = Stopwatch.StartNew();

            for (int i = 0; i < cantidadDePujas; i++)
            {
                var bid = new SendBidDto
                {
                    LotId = lotId,
                    Amount = 8000 + i,
                    BuyerId = buyerId,
                    IsAutoBid = false
                };

                await _bidPublisher.Publish(bid);
            }
            await Task.WhenAll(tasks);

            stopwatch.Stop();

            return (cantidadDePujas, stopwatch);
        }
        public async Task EditLot(Guid lotId, EditLotDto editLotDto, Guid userId, string userIdFromToken)
        {
            var auctionLot = await db.AuctionLots
                .Include(al => al.Auction)
                    .ThenInclude(a => a.Auctioneer)
                .Include(al => al.Lot)
                    .ThenInclude(l => l.BiddingHistory)
                .FirstOrDefaultAsync(al => al.IsOriginalAuction && al.LotId == lotId) ?? throw new NotFoundException("Lot not found");

            if (auctionLot.Auction.Auctioneer.UserId.ToString() != userIdFromToken)
            {
                throw new UnauthorizedException("Access Denied: You can only edit your own lots");
            }

            if (auctionLot.Lot.BiddingHistory != null && auctionLot.Lot.BiddingHistory.Count != 0)
            {
                throw new BadRequestException("Cannot edit lot that already has bids");
            }

            if (auctionLot.AuctionId != editLotDto.AuctionId)
            {
                var existingAuction = await db.Auctions
                    .FirstOrDefaultAsync(a => a.Id == editLotDto.AuctionId
                                && userId == a.Auctioneer.UserId
                                && a.Status != AuctionStatus.Storage) ?? throw new BadRequestException("You cannot assign an auction that is not yours. Sorry.");
            }

            if (editLotDto.Image != null && editLotDto.Image.Length > 0)
            {
                string newHash;
                using var newImageStream = editLotDto.Image.OpenReadStream();
                newHash = await imageService.CalculateHashAsync(newImageStream);

                if (!string.IsNullOrEmpty(auctionLot.Lot.ImageUrl))
                {
                    try
                    {
                        using var oldImageStream = await imageService.DownloadImageAsync(auctionLot.Lot.ImageUrl);
                        var oldHash = await imageService.CalculateHashAsync(oldImageStream);

                        if (newHash != oldHash)
                        {
                            // si son diferentes se sube la nueva imagen
                            var newImageUrl = await imageService.UploadImageAsync(editLotDto.Image, "lots");
                            auctionLot.Lot.ImageUrl = newImageUrl;
                        }
                    }
                    catch
                    {
                        // si hay un erro al descargar la imagen anterior se sube la nueva
                        var imageUrlNew = await imageService.UploadImageAsync(editLotDto.Image, "lots");
                        auctionLot.Lot.ImageUrl = imageUrlNew;
                    }
                }
                else
                {
                    // si no habia imagen en el lote
                    var nuevaUrl = await imageService.UploadImageAsync(editLotDto.Image, "lots");
                    auctionLot.Lot.ImageUrl = nuevaUrl;
                }
            }

            if (editLotDto.LotNumber != auctionLot.Lot.LotNumber)
            {
                var existingLot = await db.AuctionLots
                    .Include(al => al.Lot)
                    .AnyAsync(al => al.Lot.LotNumber == editLotDto.LotNumber &&
                                al.AuctionId == editLotDto.AuctionId &&
                                al.LotId != lotId &&
                                al.IsOriginalAuction);

                if (existingLot)
                {
                    throw new BadRequestException("The Lot number is already taken in this auction");
                }
            }

            var finalAuction = await db.Auctions.FindAsync(editLotDto.AuctionId) ?? throw new BadRequestException("Auction not found. Sorry");

            auctionLot.Lot.Title = editLotDto.Title;
            auctionLot.Lot.LotNumber = editLotDto.LotNumber;
            auctionLot.Lot.Description = editLotDto.Description;
            auctionLot.Lot.Details = editLotDto.Details;
            auctionLot.Lot.StartingPrice = editLotDto.StartingPrice;

            if (auctionLot.Lot.BiddingHistory == null || auctionLot.Lot.BiddingHistory.Count == 0)
            {
                auctionLot.Lot.CurrentPrice = editLotDto.StartingPrice;
            }

            if (auctionLot.AuctionId != editLotDto.AuctionId) // Si se quiere cambiar de auction 
            {

                var storageAuctionLot = await db.AuctionLots // Checkea si el lote tiene una relacion con el storage
                    .Include(al => al.Auction)
                    .FirstOrDefaultAsync(al =>
                        al.LotId == lotId &&
                        al.Auction.Status == AuctionStatus.Storage);

                if (storageAuctionLot != null)
                {
                    db.AuctionLots.Remove(storageAuctionLot); // Borramos referencia con el Storage
                }

                var exists = await db.AuctionLots // Checkea si ya existe alguna relacion auction <-> lot con los datos del dto
                    .AnyAsync(al => al.AuctionId == editLotDto.AuctionId && al.LotId == lotId);

                if (!exists) // sino existe la crea
                {
                    var newAuctionLot = new AuctionLot
                    {
                        AuctionId = editLotDto.AuctionId,
                        LotId = lotId,
                        IsOriginalAuction = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    db.AuctionLots.Add(newAuctionLot);
                }
                else
                {
                    var existingAuctionLot = await db.AuctionLots
                        .FirstAsync(al => al.AuctionId == editLotDto.AuctionId && al.LotId == lotId);

                    existingAuctionLot.IsOriginalAuction = true;
                    existingAuctionLot.UpdatedAt = DateTime.UtcNow;
                }
            }

            await db.SaveChangesAsync();
        }
        public async Task<AutoBidConfig> RegisterAutoBid(Guid lotId, Guid buyerId, CreateAutoBidDto dto, Guid parsedUserId)
        {
            var existingLot = await db.AuctionLots
                    .Include(al => al.Auction.Auctioneer)
                    .Include(al => al.Lot)
                    .FirstOrDefaultAsync(al => al.LotId == lotId) ?? throw new ArgumentException("Lot not found"); ;

            if (existingLot.Auction.AuctioneerId == parsedUserId) { throw new UnauthorizedException("Access Denied: Cannot Auto-bid on your own lot"); }

            var userDetails = await db.UserDetails.FirstOrDefaultAsync(ud => ud.UserId == buyerId) ?? throw new ArgumentException("Not found"); ;

            var autoBid = await _autoBidService.CreateAutoBidAsync(userDetails.Id, lotId, dto);

            return autoBid;
        }

        public async Task CancelAutoBid(Guid autoBidId, Guid parsedUserId)
        {
            var success = await _autoBidService.CancelAutoBidAsync(autoBidId, parsedUserId);

            if (!success) { throw new NotFoundException("Auto-bid not found"); }
        }

        public async Task DeleteLot(Guid lotId)
        {
            using var transaction = await db.Database.BeginTransactionAsync();
            
            var auctionLot = await db.AuctionLots
                .Include(al => al.Lot)
                .Include(al => al.Auction)
                .FirstOrDefaultAsync(al => al.LotId == lotId) ?? throw new NotFoundException("AuctionLot not found");

            var lot = await db.Lots.FirstOrDefaultAsync(l => l.Id == lotId) ?? throw new NotFoundException("Lot not found");
            if (!string.IsNullOrEmpty(lot.ImageUrl))
            {
                try
                {
                    await imageService.DeleteImageAsync(lot.ImageUrl);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error al borrar la imagen: {ex.Message}");
                }
            }

            if (auctionLot.Auction.Status != AuctionStatus.Closed)
            {
                db.AuctionLots.Remove(auctionLot);
                db.Lots.Remove(lot);
                await db.SaveChangesAsync();
            }

            await transaction.CommitAsync();
        }

    }
}