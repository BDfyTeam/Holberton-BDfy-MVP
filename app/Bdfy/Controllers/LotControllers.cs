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
					.Where(l => l.Auction.AuctioneerId == auctioneer_id)
					.ToListAsync();

				if (lotsByAuctioneerId == null || !lotsByAuctioneerId.Any())
				{
					return NotFound("No lots found for this auctioneer.");
				}

				var lotDtos = lotsByAuctioneerId.Select(lotById => new GetLotByIdDto
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
		
	}
}        
	