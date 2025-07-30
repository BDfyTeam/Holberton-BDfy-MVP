using Microsoft.AspNetCore.Mvc;
using BDfy.Data;
using BDfy.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using BDfy.Models;

namespace BDfy.Controllers
{
    [ApiController]
    [Route("api/1.0/live")]
    public class LiveKitControllers(BDfyDbContext db, ILogger<LiveKitControllers> logger, LiveKitService liveKit) : BaseController(db)
    {
        private ILogger<LiveKitControllers> _logger = logger;

        [Authorize]
        [HttpPost("{auctionId}/{auctioneerId}")]
        public async Task<ActionResult> CreateRoom([FromRoute] Guid auctioneerId, [FromRoute] Guid auctionId)
        {
            var userClaims = HttpContext.User;
            var userIdFromToken = userClaims.FindFirst("Id")?.Value;
            var userRoleFromToken = userClaims.FindFirst("Role")?.Value;

            if (userIdFromToken != auctioneerId.ToString())
            {
                return Forbid();
            }

            // Faltan validaciones

            User auctioneer = await _db.Users
                .Include(u => u.AuctioneerDetails)
                .FirstOrDefaultAsync(u => u.Id == auctioneerId) ?? throw new Exception("Auctioneer Not Found");

            Auction auction = await _db.Auctions.FirstOrDefaultAsync(a => a.Id == auctionId) ?? throw new Exception("Auction Not Found");

            string apiKey = System.Environment.GetEnvironmentVariable("API_KEY") ?? throw new Exception("Api key not setted");
            string apiSecret = System.Environment.GetEnvironmentVariable("API_SECRET") ?? throw new Exception("Api secret not setted");

            var token = liveKit.GenerateLiveKitToken(apiKey, apiSecret, auctioneerId, auctioneer.FirstName, auction.Title);

            return Ok(new
            { 
                Token = token
            });
        }
    }
}