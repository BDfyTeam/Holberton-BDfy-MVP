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
        public async Task<ActionResult> Register([FromRoute] Guid userId, [FromForm] RegisterAuctionDto Dto)
        {
            try
            {
                var userClaims = HttpContext.User;
                var userIdFromToken = userClaims.FindFirst("Id")?.Value;
                var userRoleFromToken = userClaims.FindFirst("Role")?.Value;

                if (userId.ToString() != userIdFromToken) { return Unauthorized("Access Denied: Diffrent User as the login"); }

                if (userRoleFromToken != UserRole.Auctioneer.ToString()) { return Unauthorized("Access Denied: Only Auctioneers can create Auctions"); }

                var auction = await _auctionServices.CreateAuction(userId, Dto);

                return Created($"/api/1.0/auctions/{auction.Id}", new
                {
                    message = "Auction created"
                });
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
                return Ok(auctions);
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

                var auctionsDto = await _auctionServices.GetAuctionsByAuctioneerId(auctioneerId);
                
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
                var auctions = await _auctionServices.GetAucionByStatus(status);
                return Ok(auctions);
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
                var auction = await _auctionServices.GetAuctionById(auctionId);
                return Ok(auction);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }

        [Authorize]
        [HttpGet("{status}/{auctioneerId}")]
        public async Task<ActionResult<LotsDto>> GetStorageById([FromRoute] Guid auctioneerId, [FromRoute] string status)
        {
            try
            {
                var auctioneerClaims = HttpContext.User;
                var auctioneerIdToken = auctioneerClaims.FindFirst("Id")?.Value;
                var auctioneerRoleToken = auctioneerClaims.FindFirst("Role")?.Value;

                if (auctioneerId.ToString() != auctioneerIdToken) { return Unauthorized("Access Denied: Diffrent Auctioneer as the login"); }

                if (auctioneerRoleToken != UserRole.Auctioneer.ToString()) { return Unauthorized("Access Denied: Only Auctioneers can use Storage option"); }

                var lotsInStorage = await _auctionServices.GetStorageById(auctioneerId, status);
                
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
                var auctionsByCategory = await _auctionServices.GetCategoryByNumber(Category);
                return Ok(auctionsByCategory);
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

                await _auctionServices.EditAuction(auctionId, auctioneerId, dto);

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

                await _auctionServices.DeleteAuctionById(auctionId, auctioneerId);

                return NoContent();
            }

            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }
    }
}