using Microsoft.AspNetCore.Mvc;
using BDfy.Dtos;
using BDfy.Data;
using BDfy.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

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
		public async Task<ActionResult> Register(Guid auctionID, [FromBody] RegisterLot Dto)
		{
			try
			{
				var userClaims = HttpContext.User;
				var userRoleFromToken = userClaims.FindFirst("Role")?.Value;
				var userIdFromToken = userClaims.FindFirst("Id")?.Value;

				var auction = await _db.Auctions
					.Include(a => a.Auctioneer)
					.Include(a => a.Lots)
    				.FirstOrDefaultAsync(a => a.Id == auctionID);

				if (auction == null) { return NotFound("Auction not found"); }

				if (auction.Auctioneer.UserId.ToString() != userIdFromToken) { return Unauthorized("Access Denied: Diffrent User as the login"); }

				if (userRoleFromToken != UserRole.Auctioneer.ToString()) { return Unauthorized("Access Denied: Only Auctioneers can create Lots"); }

				if (!ModelState.IsValid) { return BadRequest(ModelState); }

				var lot = new Lot
				{
					LotNumber = Dto.LotNumber,
					Description = Dto.Description,
					Details = Dto.Details,
					StartingPrice = Dto.StartingPrice,
					AuctionId = auctionID,
					Auction = auction
				};

				var checkLot = await _db.Lots
    					.FirstOrDefaultAsync(l => l.LotNumber == Dto.LotNumber && l.AuctionId == auctionID);
				
				if (checkLot != null) {throw new InvalidOperationException("The Lot number on this Auction is already taken");}

				auction.Lots.Add(lot); // Arreglar

				_db.Lots.Add(lot);
				await _db.SaveChangesAsync();

				return Created();
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message }); // Entraba aca l.AuctionId
			}
		}
	}
}        