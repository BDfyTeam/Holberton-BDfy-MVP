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
                var userIdFromToken = userClaims.FindFirst("id")?.Value;
                var userRoleFromToken = userClaims.FindFirst("role")?.Value;

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
    }
}