using Microsoft.AspNetCore.Mvc;
using BDfy.Dtos;
using BDfy.Data;
using BDfy.Hub;
using BDfy.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using BDfy.Services;
using System.Diagnostics;
using Microsoft.VisualBasic;

namespace BDfy.Controllers
{
	[ApiController]
	[Route("api/1.0/lots")]
	public class BaseControllerLots(BDfyDbContext db) : Controller { protected readonly BDfyDbContext _db = db; }
	public class LotController(BDfyDbContext db, LotService lotservice , IHubContext<BdfyHub,IClient> hubContext, BiddingHistoryService biddingHistoryService) : BaseControllerLots(db) // Heredamos la DB para poder usarla
	{
		private readonly IHubContext<BdfyHub, IClient> _hubContext = hubContext;
		private BiddingHistoryService _bh = biddingHistoryService;

		[Authorize]
		[HttpPost("{auctionId}")]
		public async Task<ActionResult> RegisterLot([FromRoute] Guid auctionId, [FromForm] RegisterLot Dto)
		{
			try
			{
				if (!ModelState.IsValid) { return BadRequest(ModelState); }

				var userClaims = HttpContext.User;
				var userRoleFromToken = userClaims.FindFirst("Role")?.Value;
				var userIdFromToken = userClaims.FindFirst("Id")?.Value;

				if (!Guid.TryParse(userIdFromToken, out var userId)) { return Unauthorized("Invalid user token"); }

				if (userRoleFromToken != UserRole.Auctioneer.ToString()) { return Forbid("Access Denied: Only Auctioneers can create Lots"); }

				var lot = await lotservice.Register(Dto, auctionId, userId);

				return Created($"/api/1.0/lots/{lot.Id}", new
				{
					message = "Lot registered successfully",
					lotId = lot.Id
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}

		[HttpGet("{auctioneer_id}")]
		public async Task<ActionResult<IEnumerable<GetLotByIdDto>>> GetLotByAuctioneerId([FromRoute] Guid auctioneer_id)
		{
			try
			{
				var lots = await lotservice.GetLotByAuctioneerId(auctioneer_id);
				return Ok(lots);
			}
			catch (Exception ex)
			{
				return StatusCode(500, "Internal Server Error: " + ex.Message);
			}
		}

		[HttpGet("specific/{lotId}")]
		public async Task<ActionResult<GetLotByIdDto>> GetLotById([FromRoute] Guid lotId)
		{
			try
			{
				var lot = await lotservice.GetLotById(lotId);
				return Ok(lot);
			}
			catch (Exception ex)
			{
				return StatusCode(500, "Internal Server Error: " + ex.Message);
			}
		}
		[HttpGet("_internal")]
		public async Task<ActionResult<IEnumerable<LotGetDto>>> GetAllLots()
		{
			try
			{
				var lots = await lotservice.GetAllLots();
				return Ok(lots);
			}
			catch (Exception ex)
			{
				return StatusCode(500, "Internal Server Error: " + ex.Message);
			}
		}

		[Authorize]
		[HttpPost("bid/{lotId}")]
		public async Task<ActionResult> PostBid([FromBody] BidDto bid, [FromRoute] Guid lotId)
		{
			try
			{
				var userClaims = HttpContext.User;
				var userRoleFromToken = userClaims.FindFirst("Role")?.Value;
				var userIdFromToken = userClaims.FindFirst("Id")?.Value;

				if (!ModelState.IsValid) { return BadRequest(ModelState); }

				if (string.IsNullOrEmpty(userIdFromToken) || !Guid.TryParse(userIdFromToken, out Guid parsedUserId)) { return Unauthorized("Invalid User ID in token"); }

				if (userRoleFromToken != UserRole.Buyer.ToString()) { return Unauthorized("Access Denied: Only Buyers can bid in Lots"); }

				await lotservice.PostBid(bid, lotId, parsedUserId);

				return Created($"/api/lots/bid/{lotId}", new
				{
					message = "Bid created successfully",
					lotId = lotId,
					amount = bid.Amount
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, "Internal Server Error: " + ex.Message);
			}

		}
		[HttpPost("stress-test/{lotId}/{buyerId}")]
		public async Task<ActionResult> StressTest([FromRoute] Guid lotId, [FromRoute] Guid buyerId)
		{
			var stressTest = await lotservice.StressTest(lotId, buyerId);

			return Ok(new
			{
				mensaje = $"Test de concurrencia terminado en {stressTest.Item2.ElapsedMilliseconds} ms",
				total = stressTest.Item1
			});
		}
		[Authorize]
		[HttpPut("{lotId}/edit")]
		public async Task<ActionResult> EditLot([FromRoute] Guid lotId, [FromForm] EditLotDto editLotDto)
		{
			try
			{
				if (!ModelState.IsValid)
				{
					return BadRequest(ModelState);
				}
				var userClaims = HttpContext.User;
				var userRoleFromToken = userClaims.FindFirst("Role")?.Value;
				var userIdFromToken = userClaims.FindFirst("Id")?.Value;
				var userIsAdmin = userClaims.FindFirst("IsAdmin")?.Value;

				if (string.IsNullOrEmpty(userIdFromToken) || !Guid.TryParse(userIdFromToken, out var userId)) { return Unauthorized("Invalid user token"); }

				if (userRoleFromToken != UserRole.Auctioneer.ToString())
				{
					return Unauthorized("Access Denied: Only Auctioneers or admins can edit Lots");
				}

				await lotservice.EditLot(lotId, editLotDto, userId);

				return Ok(new { message = "Lot updated successfully", lotId = lotId });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}

		[Authorize]
		[HttpPost("auto-bid/{lotId}/{buyerId}")]
		public async Task<IActionResult> RegisterAutoBid([FromRoute] Guid lotId, [FromRoute] Guid buyerId, [FromBody] CreateAutoBidDto dto)
		{
			try
			{
				if (!ModelState.IsValid) { return BadRequest(ModelState); }
				var userClaims = HttpContext.User;
				var userRoleFromToken = userClaims.FindFirst("Role")?.Value;
				var userIdFromToken = userClaims.FindFirst("Id")?.Value;

				if (userRoleFromToken != UserRole.Buyer.ToString()) { return Unauthorized("Access Denied: Only Buyers can register Auto-bids"); }

				if (!Guid.TryParse(userIdFromToken, out Guid parsedUserId)) { return Unauthorized("Invalid user ID"); }

				var autoBid = await lotservice.RegisterAutoBid(lotId, buyerId, dto, parsedUserId);
				return Ok(new
				{
					message = "Auto-bid created successfully",
					autoBidId = autoBid.Id,
					maxBid = autoBid.MaxBid,
					increment = autoBid.IncreasePrice
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}

		[Authorize]
		[HttpDelete("auto-bid/{autoBidId}")]
		public async Task<ActionResult> CancelAutoBid([FromRoute] Guid autoBidId)
		{
			try
			{
				var userIdFromToken = HttpContext.User.FindFirst("Id")?.Value;
				var userRoleFromToken = HttpContext.User.FindFirst("Role")?.Value;

				if (!Guid.TryParse(userIdFromToken, out Guid parsedUserId)) { return Unauthorized("Invalid user ID"); }

				if (userRoleFromToken != UserRole.Buyer.ToString()) { return Forbid("Only buyers can do and cancel auto-bids"); }

				await lotservice.CancelAutoBid(autoBidId, parsedUserId);

				return Ok(new { message = "Auto-bid cancelled successfully" });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}
		[HttpGet("{lotId}/bidding-history")]
		public async Task<ActionResult<BiddingHistoryDto>> GetAllBidsByLotId([FromRoute] Guid lotId)
		{
			try
			{
				var biddingHistory = await _bh.GetAllBidsByLotId(lotId);
				return Ok(biddingHistory);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}
		[Authorize]
		[HttpDelete("{lotId}")]

		public async Task<IActionResult> DeleteLot([FromRoute] Guid lotId)
		{
			using var transaction = await _db.Database.BeginTransactionAsync();
			try
			{
				if (!ModelState.IsValid) { return BadRequest(ModelState); }

				var auctioneerClaims = HttpContext.User;
				var auctioneerRoleFromToken = auctioneerClaims.FindFirst("Role")?.Value;
				var auctioneerIdFromToken = auctioneerClaims.FindFirst("Id")?.Value;

				if (!Guid.TryParse(auctioneerIdFromToken, out var auctioneerId)) { return Unauthorized("Invalid auctioneer token"); }

				await lotservice.DeleteLot(lotId);

				return Ok(new { message = "Lot deleted successfully" });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}
	}
}
	