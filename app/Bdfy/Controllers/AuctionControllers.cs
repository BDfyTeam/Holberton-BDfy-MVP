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
                    AuctioneerId = auctioneer.Id,
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
        public async Task<ActionResult<IEnumerable<User>>> GetAllAuction()
        {
            try
            {
                var auctions = await _db.Auctions
                    .Include(ad => ad.Auctioneer) // Re pensar y usar Dtos para la circularidad
                    .ToListAsync();

                return Ok(auctions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }
        [HttpGet("{status}")]
        public async Task<ActionResult<IEnumerable<User>>> GetAucionByStatus(AuctionStatus Status)
        {
            try
            {
                var auctionStatus = await _db.Auctions
                        .Include(ad => ad.Auctioneer)
                        .FirstOrDefaultAsync(a => a.Status == Status);

                return Ok(auctionStatus);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }

        [HttpGet("specific/{auctionId}")]
        public async Task<ActionResult<Auction>> GetAuctionById([FromRoute] Guid auctionId)
        {
            try
            {
                var auctionById = await _db.Auctions
                        .Include(ad => ad.Auctioneer)
                        .FirstOrDefaultAsync(a => a.Id == auctionId);
                        
                if (auctionById == null) { return NotFound("Auction not found"); }
    
                return Ok(auctionById);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }
    }
}