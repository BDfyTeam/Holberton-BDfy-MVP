using BDfy.Dtos;
using Microsoft.AspNetCore.Mvc;
using BDfy.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BDfy.Models;

namespace BDfy.Controllers
{
    public class BasaeController(BDfyDbContext db) : Controller // Para no tener que instanciar la db en los endpoints
    {
        protected readonly BDfyDbContext _db = db; // La db
    }
    [ApiController]
    [Route("api/1.0/auctions")]
    public class AuctionsController(BDfyDbContext db) : BaseController(db)
    {
        [Authorize]
        [HttpPost("{userId}")]
        public async Task<ActionResult> Register(Guid userId, [FromBody] RegisterAuctionDto Dto)
        {
            try
            {
                var userClaims = HttpContext.User;
                var userIdFromToken = userClaims.FindFirst("Id")?.Value;
                var userRoleFromToken = userClaims.FindFirst("Role")?.Value;

                if (userId.ToString() != userIdFromToken) { return Unauthorized("Access Denied: Diffrent User as the login"); }

                if (userRoleFromToken != UserRole.Auctioneer.ToString()) { return Unauthorized("Access Denied: Only Auctioneers can create Auctions"); }

                if (!ModelState.IsValid) { return BadRequest(ModelState); } // Valido el body

                var auctioneer = await _db.Users
                    .Include(u => u.AuctioneerDetails)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (auctioneer == null || auctioneer.AuctioneerDetails == null) { return NotFound("User not found"); }

                var auction = new Auction
                {
                    Title = Dto.Title,
                    Description = Dto.Description,
                    StartAt = Dto.StartAt,
                    EndAt = Dto.EndAt,
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
                    .Include(ad => ad.Auctioneer) // Re pensar y usar Dtos para la circularidad
                    .ToListAsync();

                var auctionDtos = auctions.Select(a => new AuctionDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Description = a.Description,
                    StartAt = a.StartAt,
                    EndAt = a.EndAt,
                    Category = a.Category ?? [],
                    Status = a.Status,
                    Direction = a.Direction,
                    AuctioneerId = a.AuctioneerId,
                    Lots = a.Lots.ToList(),
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
                        .Where(a => a.Status == enumStatus)
                        .ToListAsync();

                if (enumStatus == AuctionStatus.Storage)
                {
                    return Unauthorized("Access Denied");
                }

                var auctionDtos = auctions.Select(a => new AuctionDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Description = a.Description,
                    StartAt = a.StartAt,
                    EndAt = a.EndAt,
                    Category = a.Category ?? [],
                    Status = a.Status,
                    Direction = a.Direction,
                    AuctioneerId = a.AuctioneerId,
                    Lots = a.Lots.ToList(),
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
                        .FirstOrDefaultAsync(a => a.Id == auctionId);

                if (auctionById == null) { return NotFound("Auction not found"); }

                var auctionDto = new AuctionDto
                {
                    Id = auctionById.Id,
                    Title = auctionById.Title,
                    Description = auctionById.Description,
                    StartAt = auctionById.StartAt,
                    EndAt = auctionById.EndAt,
                    Category = auctionById.Category ?? [],
                    Status = auctionById.Status,
                    Direction = auctionById.Direction,
                    AuctioneerId = auctionById.AuctioneerId,
                    Lots = auctionById.Lots.ToList(), // Arreglar
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
                    .Where(l => l.Auction.AuctioneerId == auctioneerId
                        && l.Auction.Status == AuctionStatus.Storage // El lote ya estaria en el Storage
                        && l.Sold == false)
                    .Select(l => new LotsDto
                    {
                        Id = l.Id,
                        LotNumber = l.LotNumber,
                        Description = l.Description,
                        Details = l.Details,
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
        
    }
}