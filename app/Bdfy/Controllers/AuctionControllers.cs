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
    public class AuctionControllers(BDfyDbContext db, AuctionServices auctionServices)  : BaseController(db)
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

                var userClaims = HttpContext.User;
                var userIdFromToken = userClaims.FindFirst("Id")?.Value;
                var userRoleFromToken = userClaims.FindFirst("Role")?.Value;

                if (userId.ToString() != userIdFromToken) { return Unauthorized("Access Denied: Diffrent User as the login"); }

                if (userRoleFromToken != UserRole.Auctioneer.ToString()) { return Unauthorized("Access Denied: Only Auctioneers can create Auctions"); }

                if (!ModelState.IsValid) { return BadRequest(ModelState); }

                if (startAtUtc >= endAtUtc) { return BadRequest("Start date must be before end date"); }

                if (startAtUtc < DateTime.UtcNow.AddMinutes(-5).ToUniversalTime()) { return BadRequest("Start date cannot be in the past"); }

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
                    .Include(a => a.Lots)
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
                    Lots = a.Lots.Select(l => new LotsDto
                    {
                        Id = l.Id,
                        LotNumber = l.LotNumber,
                        Description = l.Description,
                        Details = l.Details,
                        AuctionId = l.AuctionId,
                        StartingPrice = l.StartingPrice,
                        CurrentPrice = l.CurrentPrice ?? l.StartingPrice,
                        EndingPrice = l.EndingPrice ?? 0,
                        Sold = l.Sold
                        
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
                    .Include(a => a.Lots)
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
                    Lots = a.Lots.Select(l => new LotGetDto
                    {
                        Id = l.Id,
                        StartingPrice = l.StartingPrice,
                        CurrentPrice = l.CurrentPrice ?? l.StartingPrice,
                        Description = l.Description,
                        Details = l.Details,
                        AuctionId = l.AuctionId,
                        LotNumber = l.LotNumber,
                        Sold = l.Sold,
                        EndingPrice = l.EndingPrice ?? 0,
                        WinnerId = l.WinnerId
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
                        .Include(a => a.Lots)
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
                    Lots = a.Lots.Select(l => new LotsDto
                    {
                        Id = l.Id,
                        LotNumber = l.LotNumber,
                        Description = l.Description,
                        Details = l.Details,
                        AuctionId = l.AuctionId,
                        StartingPrice = l.StartingPrice,
                        CurrentPrice = l.CurrentPrice ?? l.StartingPrice,
                        EndingPrice = l.EndingPrice ?? 0,
                        Sold = l.Sold
                        
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

        [HttpGet("specific/{auctionId}")]
        public async Task<ActionResult<AuctionDto>> GetAuctionById([FromRoute] Guid auctionId)
        {
            try
            {
                var auctionById = await _db.Auctions
                        .Include(ad => ad.Auctioneer)
                        .Include(a => a.Lots)
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
                    Lots = auctionById.Lots.Select(l => new LotsDto
                    {
                        Id = l.Id,
                        LotNumber = l.LotNumber,
                        Description = l.Description,
                        Details = l.Details,
                        AuctionId = l.AuctionId,
                        StartingPrice = l.StartingPrice,
                        CurrentPrice = l.CurrentPrice ?? l.StartingPrice,
                        EndingPrice = l.EndingPrice ?? 0,
                        Sold = l.Sold
                        
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

                var lotsInStorage = await _db.Lots
                    .Where(l => auctioneer.Id == auctioneerId
                        && l.Auction.Status == AuctionStatus.Storage // El lote ya estaria en el Storage
                        && l.Sold == false)
                    .Select(l => new LotsDto
                    {
                        Id = l.Id,
                        LotNumber = l.LotNumber,
                        Description = l.Description,
                        Details = l.Details,
                        AuctionId = l.AuctionId,
                        StartingPrice = l.StartingPrice,
                        CurrentPrice = l.CurrentPrice ?? l.StartingPrice,
                        EndingPrice = l.EndingPrice ?? 0,
                        Sold = l.Sold
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

    }
}