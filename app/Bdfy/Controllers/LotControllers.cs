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
					CurrentPrice = Dto.StartingPrice,
					AuctionId = auctionID,
					Auction = auction,
					Sold = false
				};

				var checkLot = await _db.Lots
					.FirstOrDefaultAsync(l => l.LotNumber == Dto.LotNumber && l.AuctionId == auctionID);

				if (checkLot != null) { throw new InvalidOperationException("The Lot number on this Auction is already taken"); }

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

		[HttpGet("{lotId}")]
		public async Task<ActionResult<GetLotByIdDto>>GetLotById([FromRoute]Guid lotId)
		{
		 try
            {
				var lotById = await _db.Lots
					.Include(l => l.Auction)
						.ThenInclude(a => a.Auctioneer)
					.FirstOrDefaultAsync(l => l.Id == lotId);

				if (lotById == null) { return NotFound("Lot not found. Sorry");}


				var lotDto = new GetLotByIdDto
				{
					Id = lotById.Id,
					LotNumber = lotById.LotNumber,
					Description = lotById.Description,
					Details = lotById.Details,
					StartingPrice = lotById.StartingPrice,
					CurrentPrice = lotById.CurrentPrice ?? lotById.StartingPrice,
					EndingPrice = lotById.EndingPrice ?? 0,
					Sold = lotById.Sold,
					Auction = new LotByIdAuctionDto
					{
						Id = lotById.Auction.Id,
						Title = lotById.Auction.Title,
						Description = lotById.Auction.Description,
						StartAt = lotById.Auction.StartAt,
						EndAt = lotById.Auction.EndAt,
						Category = lotById.Auction.Category ?? [],
						Status = lotById.Auction.Status,
						AuctioneerId = lotById.Auction.AuctioneerId,
						Auctioneer = new AuctioneerDto
						{
							UserId = lotById.Auction.Auctioneer.UserId,
							Plate = lotById.Auction.Auctioneer.Plate
						}
					}
				};
				return Ok(lotDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }
        [HttpGet]
		public async Task<ActionResult<IEnumerable<LotGetDto>>> GetAllLots()
		{
			try
			{
				var lots = await _db.Lots.ToListAsync();

				var lotsDto = lots.Select(l => new LotGetDto
				{
					Id = l.Id,
					LotNumber = l.LotNumber,
					Description = l.Description,
					Details = l.Details,
					StartingPrice = l.StartingPrice,
					CurrentPrice = l.CurrentPrice ?? l.StartingPrice,
					EndingPrice = l.EndingPrice ?? 0,
					Sold = l.Sold,
					AuctionId = l.AuctionId
				});

				return Ok(lotsDto);
			}
			catch (Exception ex)
			{
                return StatusCode(500, "Internal Server Error: " + ex.Message);
			}
		}


		[Authorize]
        [HttpPost("/bid/{lotId}")]
        public async Task<ActionResult<AuctionDto>> PostBid([FromBody] BidDto bid, [FromRoute] Guid lotId)
        {
			try
			{
				var userClaims = HttpContext.User;
				var userRoleFromToken = userClaims.FindFirst("Role")?.Value;
				var userIdFromToken = userClaims.FindFirst("Id")?.Value;

				var lot = await _db.Lots
					.Include(l => l.Auction)
						.ThenInclude(a => a.Auctioneer)
					.Include(l => l.BiddingHistory)
					.FirstOrDefaultAsync(l => l.Id == lotId);

				if (lot == null) { return NotFound("Lot not found"); }

				if (lot.Auction.Auctioneer.UserId.ToString() == userIdFromToken) { return Unauthorized("Access Denied: You cannot bid in your own Lot"); }

				if (userRoleFromToken != UserRole.Buyer.ToString()) { return Unauthorized("Access Denied: Only Buyers can bid in Lots"); }

				if (!ModelState.IsValid) { return BadRequest(ModelState); }

				if (bid.LotId != lotId)
				{
					return BadRequest("LotId in the body does not match the LotId in the route");
				}

				if (!Guid.TryParse(userIdFromToken, out Guid parsedUserId))
				{
					return Unauthorized("Invalid User ID in token");
				}

				var user = await _db.Users
					.Include(u => u.UserDetails)
					.FirstOrDefaultAsync(u => u.Id == parsedUserId);
				
				if (user == null || user.UserDetails == null) { return BadRequest("User details not found for the current user"); }

				var Bid = new Bid
				{
					Amount = bid.Amount,
					Time = bid.Time,
					LotId = bid.LotId,
					BuyerId = parsedUserId,
					Buyer = user.UserDetails
				};
		
				if (bid.Amount > lot.CurrentPrice)
				{
					Console.WriteLine("Entro al if");
					lot.CurrentPrice = Bid.Amount;
				}

				lot.BiddingHistory ??= new List<Bid>();
				lot.BiddingHistory.Add(Bid);

				_db.Bids.Add(Bid);
				await _db.SaveChangesAsync();

				// WebSocket aca <---- :D

				return Created();
			}
			catch (Exception ex)
			{
				return StatusCode(500, "Internal Server Error: " + ex.Message);
			}

		}
	}
}        
	