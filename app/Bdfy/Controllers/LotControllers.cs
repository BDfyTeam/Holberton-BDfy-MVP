using Microsoft.AspNetCore.Mvc;
using BDfy.Dtos;
using BDfy.Data;
using BDfy.Models;
using System.Text.Json;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Identity;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;


namespace BDfy.Controllers
{
	[ApiController]
	[Route("api/1.0/lots")]
	public class BaseControllerLots : Controller // Para no tener que instanciar la db en los endpoints
	{
		protected readonly BDfyDbContext _db;
		public BaseControllerLots(BDfyDbContext db)
		{
			_db = db;
		}
	}

	public class LotController : BaseControllerLots // Heredamos la DB para poder usarla
	{
		public LotController(BDfyDbContext db) : base(db) { }

	    [Authorize]
		[HttpPost]
		public async Task<ActionResult> Register(Guid AuctioneerID, [FromBody] RegisterLot Dto)
		{
			try
			{
				var userClaims = HttpContext.User;
				var userRoleFromToken = userClaims.FindFirst("Role")?.Value;
				var userIdFromToken = userClaims.FindFirst("Id")?.Value;

				if (AuctioneerID.ToString() != userIdFromToken) { return Unauthorized(""); }

				if (userRoleFromToken != UserRole.Auctioneer.ToString()) { return Unauthorized("Access Denied: Only Auctioneers can create Lots"); }

				if (!ModelState.IsValid) { return BadRequest(ModelState); }

				var auctioneer = await _db.Users
						.Include(u => u.AuctioneerDetails)
						.FirstOrDefaultAsync(u => u.Id == AuctioneerID);
				if (auctioneer == null || auctioneer.AuctioneerDetails == null) { return NotFound(); }

				var lot = new Lot
				{
					LotNumber = Dto.LotNumber,
					Description = Dto.Description,
					Details = Dto.Details,
					StartingPrice = Dto.StartingPrice,
					AuctioneerId = auctioneer.AuctioneerDetails.Id,
    				Auctioneer = auctioneer.AuctioneerDetails	
				};

				var checkLot = await _db.Lots.FirstOrDefaultAsync(l => l.LotNumber == Dto.LotNumber);

				if (checkLot == null) { return BadRequest("Lot already exists"); }

				_db.Lots.Add(lot);
				await _db.SaveChangesAsync();

				return Ok(new { message = "Lot registered successfully." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}
	}
}        