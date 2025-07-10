using BDfy.Dtos;
using Microsoft.AspNetCore.Mvc;
using BDfy.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BDfy.Models;
using BDfy.Services;

namespace BDfy.Controllers
{
    [ApiController]
    [Route("api/1.0/auctions")]
    public class AuctionControllers(BDfyDbContext db, AuctionServices auctionServices, GcsImageService imageService) : BaseController(db)
    {
        protected readonly AuctionServices _auctionServices = auctionServices;
        
        [Authorize]
        [HttpPost("{userId}")]
        public async Task<ActionResult> Register([FromRoute] Guid userId, [FromForm] RegisterAuctionDto Dto)
        {
            try
            {
                var userClaims = HttpContext.User;
                var userIdFromToken = userClaims.FindFirst("Id")?.Value;
                var userRoleFromToken = userClaims.FindFirst("Role")?.Value;

                if (userId.ToString() != userIdFromToken) { return Unauthorized("Access Denied: Diffrent User as the login"); }

                if (userRoleFromToken != UserRole.Auctioneer.ToString()) { return Unauthorized("Access Denied: Only Auctioneers can create Auctions"); }

                await _auctionServices.CreateAuction(userId, Dto);

                return Created();
            }
            catch (Exception ex)
            {
                var errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return BadRequest($"Error inesperado al crear la subasta: {errorMessage}");
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AuctionDto>>> GetAllAuction()
        {
            try
            {
                var auctions = await _auctionServices.AllAuctions();

                return auctions;
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }

        [Authorize]
        [HttpGet("auctioneer/{auctioneerId}")]
        public async Task<ActionResult<IEnumerable<AuctionDtoId>>> GetAuctionsByAuctioneerId([FromRoute] Guid auctioneerId)
        {
            try
            {
                var auctioneerClaims = HttpContext.User;
                var auctioneerIdFromToken = auctioneerClaims.FindFirst("Id")?.Value;
                var auctioneerRoleFromToken = auctioneerClaims.FindFirst("Role")?.Value;

                if (auctioneerId.ToString() != auctioneerIdFromToken) { return Unauthorized("Access Denied: Diffrent User as the login"); }

                if (auctioneerRoleFromToken != UserRole.Auctioneer.ToString()) { return Unauthorized("Access Denied: Only Auctioneers can see his specific Auctions"); }

                var auctions = await _db.Auctions
                    .Include(a => a.Auctioneer)
                    .Include(a => a.AuctionLots)
                        .ThenInclude(al => al.Lot)
                    .Where(a => a.Auctioneer.UserId == auctioneerId)
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
                return Ok(auctionsDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);

            }
        }
        [HttpGet("{status}")]
        public async Task<ActionResult<IEnumerable<AuctionDto>>> GetAucionByStatus([FromRoute] string status)
        {
            try
            {

                if (!Enum.TryParse(status, true, out AuctionStatus enumStatus)) // Convertimos el string a enum
                {
                    return BadRequest($"Invalid status: {status}");
                }

                var auctions = await _db.Auctions
                        .Include(ad => ad.Auctioneer)
                        .Include(a => a.AuctionLots)
                        .Where(a => a.Status == enumStatus)
                        .ToListAsync();

                if (enumStatus == AuctionStatus.Storage)
                {
                    return Unauthorized("Access Denied");
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
                    //.Where(al => al.IsOriginalAuction)
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

                return Ok(auctionDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }

        [HttpGet("specific/{auctionId}")]
        public async Task<ActionResult<AuctionDto>> GetAuctionById([FromRoute] Guid auctionId)
        {
            try
            {
                var auctionById = await _db.Auctions
                        .Include(ad => ad.Auctioneer)
                        .Include(a => a.AuctionLots)
                            .ThenInclude(al => al.Lot)
                        .FirstOrDefaultAsync(a => a.Id == auctionId);

                if (auctionById == null) { return NotFound("Auction not found"); }

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

                return Ok(auctionDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }
        [Authorize]
        [HttpGet("{status}/{auctioneerId}")]
        public async Task<ActionResult<AuctionDto>> GetStorageById([FromRoute] Guid auctioneerId, [FromRoute] string status)
        {
            try
            {
                if (!Enum.TryParse(status, true, out AuctionStatus enumStatus)) // Convertimos el string a enum
                {
                    return BadRequest($"Invalid status: {status}");
                }

                if (enumStatus != AuctionStatus.Storage)
                {
                    return BadRequest("Access Denied: This route is only for Storage");
                }

                var auctioneerClaims = HttpContext.User;
                var auctioneerIdToken = auctioneerClaims.FindFirst("Id")?.Value;
                var auctioneerRoleToken = auctioneerClaims.FindFirst("Role")?.Value;

                if (auctioneerId.ToString() != auctioneerIdToken) { return Unauthorized("Access Denied: Diffrent Auctioneer as the login"); }

                if (auctioneerRoleToken != UserRole.Auctioneer.ToString()) { return Unauthorized("Access Denied: Only Auctioneers can use Storage option"); }

                var auctioneer = await _db.Users
                    .Include(u => u.AuctioneerDetails)
                    .FirstOrDefaultAsync(u => u.Id == auctioneerId);

                if (auctioneer == null) { return NotFound("Auctioneer not found"); }

                var lotsInStorage = await _db.AuctionLots
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

                return Ok(lotsInStorage);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }
        [HttpGet("category/{Category}")]
        public async Task<ActionResult> GetCategoryByNumber([FromRoute] int Category)
        {
            try
            {
                var auctionByCategory = await _db.Auctions
                    .Include(a => a.AuctionLots)
                        .ThenInclude(al => al.Lot)
                    .Include(a => a.Auctioneer)
                    .Where(a => a.Category != null && a.Category.Contains(Category) && a.Status != AuctionStatus.Storage)
                    .ToListAsync();
                if (auctionByCategory == null)
                {
                    return BadRequest($"No auctions for this category {Category}");
                }

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

                return Ok(auctionsDto);
                
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }

        [Authorize]
        [HttpPut("{auctionId}")]
        public async Task<ActionResult> UpdateAuctionById([FromRoute] Guid auctionId, [FromForm] EditAuctionDto dto)
        {
            try
            {
                if (!ModelState.IsValid) { return BadRequest(ModelState); }

                var auctioneerClaims = HttpContext.User;
                var auctioneerIdFromToken = auctioneerClaims.FindFirst("Id")?.Value;
                var auctioneerRoleFromToken = auctioneerClaims.FindFirst("Role")?.Value;
                var user = await _db.Users.Include(u => u.UserDetails).FirstOrDefaultAsync(u => u.Id.ToString() == auctioneerIdFromToken);

                if (string.IsNullOrEmpty(auctioneerIdFromToken) || !Guid.TryParse(auctioneerIdFromToken, out var auctioneerId)) { return Unauthorized("Invalid user token"); }

                if (auctioneerRoleFromToken != UserRole.Auctioneer.ToString() && (user == null || user.UserDetails == null || !user.UserDetails.IsAdmin))
                { return Forbid("Access denied: Only auctioneers or adminscan update auctions"); }

                var result = await _auctionServices.EditAuction(auctionId, auctioneerId, dto);

                if (result == false) { return BadRequest("Something goes wrong with the request"); }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }


        [Authorize]
        [HttpDelete("{auctionId}")]
        
        public async Task<ActionResult> DeleteAuctionById([FromRoute] Guid auctionId)
        {
            using var transaction = await _db.Database.BeginTransactionAsync();
            
            try
            {
                var auctioneerClaims = HttpContext.User;
                var auctioneerIdFromToken = auctioneerClaims.FindFirst("Id")?.Value;
                var auctioneerRoleFromToken = auctioneerClaims.FindFirst("Role")?.Value;

                if (string.IsNullOrEmpty(auctioneerIdFromToken) || !Guid.TryParse(auctioneerIdFromToken, out var auctioneerId))
                    return Unauthorized("Invalid user token");

                if (auctioneerRoleFromToken != UserRole.Auctioneer.ToString())
                    return Unauthorized("Access Denied: Only Auctioneers can delete Auctions");

                var auction = await _db.Auctions
                    .Include(a => a.AuctionLots)
                    .FirstOrDefaultAsync(a => a.Id == auctionId && a.Auctioneer.UserId == auctioneerId);

                if (auction == null)
                    return NotFound("Required information not found");

                if (auction.Status != AuctionStatus.Draft)
                    return BadRequest("Auction can only be deleted if it is in draft status");

                if (!string.IsNullOrEmpty(auction.ImageUrl))
				{
					try
					{
						await imageService.DeleteImageAsync(auction.ImageUrl);
					}
					catch (Exception ex)
					{
						Console.WriteLine($"Error al borrar la imagen: {ex.Message}");
					}
				}

                var auctionLotsToDelete = await _db.AuctionLots
                    .Where(al => al.AuctionId == auctionId && al.IsOriginalAuction)
                    .ToListAsync();

                var lotIds = auctionLotsToDelete.Select(al => al.LotId).ToList();

                _db.AuctionLots.RemoveRange(auctionLotsToDelete);

                var storage = await _db.Auctions
                    .Include(a => a.Auctioneer)
                    .FirstOrDefaultAsync(a => a.Auctioneer.UserId == auctioneerId && a.Status == AuctionStatus.Storage);

                if (storage != null)
                {
                    foreach (var lotId in lotIds)
                    { 
                        bool isMissing = !_db.AuctionLots.Local.Any(al => al.LotId == lotId);

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

                            _db.AuctionLots.Add(newAuctionLot);
                        }
                    }
                }

                await _db.SaveChangesAsync();

                _db.Auctions.Remove(auction);
                await _db.SaveChangesAsync();
                await transaction.CommitAsync();
                return NoContent();

            }

            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }
    }
}