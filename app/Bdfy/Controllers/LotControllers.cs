using Microsoft.AspNetCore.Mvc;
using BDfy.Dtos;
using BDfy.Data;
using BDfy.Hub;
using BDfy.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace BDfy.Controllers
{
	[ApiController]
	[Route("api/1.0/lots")]
	public class BaseControllerLots(BDfyDbContext db) : Controller { protected readonly BDfyDbContext _db = db; }
	public class LotController(BDfyDbContext db, IHubContext<BdfyHub, IClient> hubContext) : BaseControllerLots(db) // Heredamos la DB para poder usarla
	{
		private readonly IHubContext<BdfyHub, IClient> _hubContext = hubContext;
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


		//Hoy sabado hacer GET LOTES POR AUCTIONEER ID!!!!!!
		[HttpGet("{auctioneer_id}")]
		public async Task<ActionResult<IEnumerable<GetLotByIdDto>>> GetLotByAuctioneerId([FromRoute] Guid auctioneer_id)
		{
			try
			{
				var lotsByAuctioneerId = await _db.Lots
					.Include(l => l.Auction)
						.ThenInclude(a => a.Auctioneer)
					.Where(l => l.Auction.Auctioneer.UserId == auctioneer_id) // Auction.AuctioneerId ----> La id de la tabla AuctioneerDetails no el UserId
					.ToListAsync();

				if (lotsByAuctioneerId == null || !lotsByAuctioneerId.Any())
				{
					return NotFound("No lots found for this auctioneer.");
				}

				var lotDtos = lotsByAuctioneerId.Select(lotById => new GetLotByIdDto // Cpz cambiar por tener menos info a la vista
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
				}).ToList();

				return Ok(lotDtos);
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
				var lotById = await _db.Lots
					.Include(l => l.Auction)
						.ThenInclude(a => a.Auctioneer)
					.FirstOrDefaultAsync(l => l.Id == lotId);

				if (lotById == null) { return NotFound("Lot not found. Sorry"); }


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
		[HttpGet("_internal")]
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
		[HttpPost("bid/{lotId}")]
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
					lot.CurrentPrice = Bid.Amount;

					var bidUpdate = new ReceiveBidDto
					{
						LotId = bid.LotId,
						CurrentPrice = bid.Amount,
						BuyerId = parsedUserId
					};

					lot.BiddingHistory ??= new List<Bid>();
					lot.BiddingHistory.Add(Bid);

					_db.Bids.Add(Bid);
					await _db.SaveChangesAsync();

					// WebSocket aca 
					await _hubContext.Clients.Group($"auction_{bid.LotId}").ReceiveBid(bidUpdate); // <---- :D

					return Created("", new { message = "Bid created successfully" });
				}
				return BadRequest(new { message = "The bid must be grater than the current price" });
			}
			catch (Exception ex)
			{
				return StatusCode(500, "Internal Server Error: " + ex.Message);
			}

		}
		[Authorize]
		[HttpPut("{lotId}/edit")]
		public async Task<ActionResult> EditLot([FromRoute] Guid lotId, [FromBody] EditLotDto editLotDto)
		{
			try
			{
				var userClaims = HttpContext.User;
				var userRoleFromToken = userClaims.FindFirst("Role")?.Value;
				var userIdFromToken = userClaims.FindFirst("Id")?.Value;

				if (userRoleFromToken != UserRole.Auctioneer.ToString())
				{
					return Unauthorized("Access Denied: Only Auctioneers can edit Lots");
				}

				if (!ModelState.IsValid)
				{
					return BadRequest(ModelState);
				}

				var lot = await _db.Lots
					.Include(l => l.Auction)
						.ThenInclude(a => a.Auctioneer)
					.Include(l => l.BiddingHistory)
					.FirstOrDefaultAsync(l => l.Id == lotId);

				if (lot == null)
				{
					return NotFound("Lot not found");
				}

				if (lot.Auction.Auctioneer.UserId.ToString() != userIdFromToken)
				{
					return Unauthorized("Access Denied: You can only edit your own lots");
				}

				if (lot.BiddingHistory != null && lot.BiddingHistory.Any())
				{
					return BadRequest("Cannot edit lot that already has bids");
				}



				if (lot.AuctionId != editLotDto.AuctionId)
				{
					var existingAuction = await _db.Auctions
						.FirstOrDefaultAsync(a => a.Id == editLotDto.AuctionId
									&& Guid.Parse(userIdFromToken) == a.Auctioneer.UserId
									&& a.Status != AuctionStatus.Storage);

					if (existingAuction == null)
					{
						return BadRequest("You cannot assign an auction that is not yours. Sorry.");
					}
				}

				if (editLotDto.LotNumber != lot.LotNumber)
				{
					var existingLot = await _db.Lots
						.FirstOrDefaultAsync(l => l.LotNumber == editLotDto.LotNumber &&
										l.AuctionId == lot.AuctionId &&
										l.Id != lotId);

					if (existingLot != null)
					{
						return BadRequest("The Lot number is already taken in this auction");
					}
				}

				var finalAuction = await _db.Auctions.FindAsync(editLotDto.AuctionId);

				if (finalAuction == null) { return BadRequest("Auction not found. Sorry"); }

				lot.LotNumber = editLotDto.LotNumber;
				lot.Description = editLotDto.Description;
				lot.Details = editLotDto.Details;
				lot.StartingPrice = editLotDto.StartingPrice;
				lot.AuctionId = editLotDto.AuctionId;
				lot.Auction = finalAuction;

				if (lot.BiddingHistory == null || !lot.BiddingHistory.Any())
				{
					lot.CurrentPrice = editLotDto.StartingPrice;
				}

				await _db.SaveChangesAsync();

				return Ok(new { message = "Lot updated successfully" });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
}
		
		
	}
}        
	