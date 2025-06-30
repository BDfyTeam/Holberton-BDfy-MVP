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
    public class AuctionControllers(BDfyDbContext db, AuctionServices auctionServices) : BaseController(db)
    {
        protected readonly AuctionServices _auctionServices = auctionServices;
        [Authorize]
        [HttpPost("{userId}")]
        public async Task<ActionResult> Register([FromRoute] Guid userId, [FromBody] RegisterAuctionDto Dto)
        {
            try
            {
                var startAtUtc = Dto.StartAt.UtcDateTime;
                var endAtUtc = Dto.EndAt.UtcDateTime;
                Console.WriteLine($"Lo que le mando: {Dto.StartAt}");
                Console.WriteLine($"Transforma a: {startAtUtc}");
                Console.WriteLine($"Actual en el back: {DateTime.UtcNow.AddMinutes(-5)}");
                Console.WriteLine($"Comparacion start < al actual: {startAtUtc < DateTime.UtcNow.AddMinutes(-5)}");
                Console.WriteLine($"Comparacion start >= end: {startAtUtc >= endAtUtc}");


                var userClaims = HttpContext.User;
                var userIdFromToken = userClaims.FindFirst("Id")?.Value;
                var userRoleFromToken = userClaims.FindFirst("Role")?.Value;

                if (userId.ToString() != userIdFromToken) { return Unauthorized("Access Denied: Diffrent User as the login"); }

                if (userRoleFromToken != UserRole.Auctioneer.ToString()) { return Unauthorized("Access Denied: Only Auctioneers can create Auctions"); }

                if (!ModelState.IsValid) { return BadRequest(ModelState); }

                if (startAtUtc >= endAtUtc) { return BadRequest("Start date must be before end date"); }

                if (startAtUtc < DateTime.UtcNow.AddMinutes(-5)) { return BadRequest("Start date cannot be in the past"); }

                var auctioneer = await _db.Users
                    .Include(u => u.AuctioneerDetails)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (auctioneer == null || auctioneer.AuctioneerDetails == null) { return NotFound("User not found"); }

                var auction = new Auction
                {
                    Title = Dto.Title,
                    Description = Dto.Description,
                    StartAt = startAtUtc,
                    EndAt = endAtUtc,
                    Category = Dto.Category ?? [],
                    Status = Dto.Status,
                    Direction = Dto.Direction,
                    AuctioneerId = auctioneer.AuctioneerDetails.UserId,
                    Auctioneer = auctioneer.AuctioneerDetails
                };

                _db.Auctions.Add(auction);
                await _db.SaveChangesAsync();

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
                var auctions = await _db.Auctions
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
                        Plate = a.Auctioneer.Plate
                    }
                }).ToList();

                return Ok(auctionDtos);
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
                    Description = a.Description,
                    StartAt = TimeZoneInfo.ConvertTimeFromUtc(a.StartAt, tz),
                    EndAt = TimeZoneInfo.ConvertTimeFromUtc(a.EndAt, tz),
                    Category = a.Category,
                    Status = a.Status,
                    Direction = a.Direction,
                    AuctioneerId = a.Auctioneer.UserId,
                    Lots = a.AuctionLots
                    //.Where(al => al.IsOriginalAuction)  Esto evita mandar las que estan en el storage
                    .Select(al => new LotGetDto
                    {
                        Id = al.LotId,
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
                                Plate = a.Auctioneer.Plate
                            }
                            : new AuctioneerDto
                            {
                                UserId = Guid.Empty,
                                Plate = 0
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
                        Plate = auctionById.Auctioneer.Plate
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
        [Authorize]
        [HttpPut("{auctionId}")]
        public async Task<ActionResult> UpdateAuctionById([FromRoute] Guid auctionId, [FromBody] EditAuctionDto dto)
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

                var auctionLotsToDelete = await _db.AuctionLots
                    .Where(al => al.AuctionId == auctionId && al.IsOriginalAuction)
                    .ToListAsync();

                var lotIds = auctionLotsToDelete.Select(al => al.LotId).ToList();

                _db.AuctionLots.RemoveRange(auctionLotsToDelete);

                Console.WriteLine($"Este es el auctioner id del token: {auctioneerId}");

                var storage = await _db.Auctions
                    .Include(a => a.Auctioneer)
                    .FirstOrDefaultAsync(a => a.Auctioneer.UserId == auctioneerId && a.Status == AuctionStatus.Storage);

                if (storage != null)
                {
                    Console.WriteLine($"Entra al if...");
                    foreach (var lotId in lotIds)
                    { 
                        Console.WriteLine($"Id del lote iterando: {lotId}");
                        bool isMissing = !_db.AuctionLots.Local.Any(al => al.LotId == lotId);

                        Console.WriteLine($"Is missing: {isMissing}");

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