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

namespace BDfy.Controllers
{
	[ApiController]
	[Route("api/1.0/lots")]
	public class BaseControllerLots(BDfyDbContext db) : Controller { protected readonly BDfyDbContext _db = db; }
	public class LotController(BDfyDbContext db, IHubContext<BdfyHub, IClient> hubContext, BidPublisher bidPublisher, IAutoBidService autoBidService, BiddingHistoryService biddingHistoryService, GcsImageService imageService) : BaseControllerLots(db) // Heredamos la DB para poder usarla
	{
		private readonly IHubContext<BdfyHub, IClient> _hubContext = hubContext;
		private readonly BidPublisher _bidPublisher = bidPublisher;
		private IAutoBidService _autoBidService = autoBidService;
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

				var auction = await _db.Auctions
					.Include(a => a.Auctioneer)
					.FirstOrDefaultAsync(a => a.Id == auctionId && a.Auctioneer.UserId == userId);

				if (auction == null) { return NotFound("Auction not found"); }

				if (auction.Status == AuctionStatus.Active || auction.Status == AuctionStatus.Closed)
				{
					return BadRequest("Lot registration is only permitted for draft auctions or the auctioneer Storage");
				}

				if (userRoleFromToken != UserRole.Auctioneer.ToString()) { return Forbid("Access Denied: Only Auctioneers can create Lots"); }

				if (auction.Auctioneer.UserId != userId) { return Unauthorized("Access Denied: Diffrent User as the login"); }

				var checkLot = await _db.AuctionLots // Busco en la tabla intermedia por algun lote que cumpla las caracteristicas
					.Include(al => al.Lot)
					.AnyAsync(al => al.Lot.LotNumber == Dto.LotNumber && al.AuctionId == auctionId && al.IsOriginalAuction);

				if (checkLot) { return BadRequest($"Lot number {Dto.LotNumber} already exists"); }

				if (Dto.Image == null || Dto.Image.Length == 0) { return BadRequest("The lot must contain an image"); }

				var urlImage = await imageService.UploadImageAsync(Dto.Image, "lots");

				var lot = new Lot // Creamos el lote
				{
					Title = Dto.Title,
					LotNumber = Dto.LotNumber,
					Description = Dto.Description,
					Details = Dto.Details,
					ImageUrl = urlImage,
					StartingPrice = Dto.StartingPrice,
					CurrentPrice = Dto.StartingPrice,
					Sold = false
				};
				_db.Lots.Add(lot);
				await _db.SaveChangesAsync();

				var auctionLot = new AuctionLot // Tabla de relacion intermedia de auction <-> lot
				{
					AuctionId = auctionId,
					LotId = lot.Id,
					IsOriginalAuction = true // Cuando se crea un lote su primer auction es el original
				};

				_db.AuctionLots.Add(auctionLot);
				await _db.SaveChangesAsync();

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
				var lotsByAuctioneerId = await _db.AuctionLots
					.Where(al => al.Auction.Auctioneer.UserId == auctioneer_id) // IsOriginal mostrara solo los lotes de subastas originales
					.Include(al => al.Lot)
					.Include(al => al.Auction)
						.ThenInclude(a => a.Auctioneer)
					.Select(al => new GetLotByIdDto
					{
						Id = al.Lot.Id,
						Title = al.Lot.Title,
						LotNumber = al.Lot.LotNumber,
						Description = al.Lot.Description,
						Details = al.Lot.Details,
						ImageUrl = al.Lot.ImageUrl,
						StartingPrice = al.Lot.StartingPrice,
						CurrentPrice = al.Lot.CurrentPrice ?? al.Lot.StartingPrice,
						EndingPrice = al.Lot.EndingPrice ?? 0,
						Sold = al.Lot.Sold,
						Auction = new LotByIdAuctionDto
						{
							Id = al.Auction.Id,
							Title = al.Auction.Title,
							Description = al.Auction.Description,
							StartAt = al.Auction.StartAt,
							EndAt = al.Auction.EndAt,
							Category = al.Auction.Category,
							ImageUrl = al.Auction.ImageUrl,
							Status = al.Auction.Status,
							AuctioneerId = al.Auction.AuctioneerId,
							Auctioneer = new AuctioneerDto
							{
								UserId = al.Auction.Auctioneer.UserId,
								Plate = al.Auction.Auctioneer.Plate,
								AuctionHouse = al.Auction.Auctioneer.AuctionHouse
							}
						}
					})
					.ToListAsync();

				if (lotsByAuctioneerId == null || lotsByAuctioneerId.Count == 0)
				{
					return NotFound("No lots found for this auctioneer.");
				}

				return Ok(lotsByAuctioneerId);
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
				var auctionLotById = await _db.AuctionLots
					.Include(al => al.Auction)
						.ThenInclude(a => a.Auctioneer)
					.Include(al => al.Lot)
					.FirstOrDefaultAsync(al => al.IsOriginalAuction && al.LotId == lotId);

				if (auctionLotById == null) { return NotFound("AuctionLot not found. Sorry"); }

				if (auctionLotById.Auction == null) { return NotFound("Auction not found. Sorry"); }

				if (auctionLotById.Lot == null) { return NotFound("Lot not found. Sorry"); }

				var lotDto = new GetLotByIdDto
				{
					Id = auctionLotById.LotId,
					Title = auctionLotById.Lot.Title,
					ImageUrl = auctionLotById.Lot.ImageUrl,
					LotNumber = auctionLotById.Lot.LotNumber,
					Description = auctionLotById.Lot.Description,
					Details = auctionLotById.Lot.Details,
					StartingPrice = auctionLotById.Lot.StartingPrice,
					CurrentPrice = auctionLotById.Lot.CurrentPrice ?? auctionLotById.Lot.StartingPrice,
					EndingPrice = auctionLotById.Lot.EndingPrice ?? 0,
					Sold = auctionLotById.Lot.Sold,
					Auction = new LotByIdAuctionDto
					{
						Id = auctionLotById.Auction.Id,
						Title = auctionLotById.Auction.Title,
						ImageUrl = auctionLotById.Auction.ImageUrl,
						Description = auctionLotById.Auction.Description,
						StartAt = auctionLotById.Auction.StartAt,
						EndAt = auctionLotById.Auction.EndAt,
						Category = auctionLotById.Auction.Category,
						Status = auctionLotById.Auction.Status,
						WinnerId = auctionLotById.Lot.Winner?.Id ?? Guid.Empty,
						AuctioneerId = auctionLotById.Auction.AuctioneerId,
						Auctioneer = new AuctioneerDto
						{
							UserId = auctionLotById.Auction.Auctioneer.UserId,
							Plate = auctionLotById.Auction.Auctioneer.Plate,
							AuctionHouse = auctionLotById.Auction.Auctioneer.AuctionHouse
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
				var auctionLots = await _db.AuctionLots
				.Include(al => al.Auction)
				.Include(al => al.Lot)
				.ToListAsync();

				var lotsDto = auctionLots.Select(al => new LotGetDto
				{
					Id = al.LotId,
					Title = al.Lot.Title,
					ImageUrl = al.Lot.ImageUrl,
					LotNumber = al.Lot.LotNumber,
					Description = al.Lot.Description,
					Details = al.Lot.Details,
					StartingPrice = al.Lot.StartingPrice,
					CurrentPrice = al.Lot.CurrentPrice ?? al.Lot.StartingPrice,
					EndingPrice = al.Lot.EndingPrice ?? 0,
					Sold = al.Lot.Sold,
					AuctionId = al.AuctionId,
					WinnerId = al.Lot.WinnerId ?? Guid.Empty
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

				var AuctionLot = await _db.AuctionLots // Obtenemos solo lo que precisamos para comparar
					.Where(al => al.LotId == lotId && al.IsOriginalAuction && al.Auction.Status == AuctionStatus.Active)
					.OrderByDescending(al => al.Auction.StartAt)
					.Select(al => new
					{
						al.LotId,
						AuctioneerId = al.Auction.Auctioneer.UserId,
						AuctionStatus = al.Auction.Status,
						AuctionEndAt = al.Auction.EndAt,
						LotCurrentPrice = al.Lot.CurrentPrice,
						LotStartingPrice = al.Lot.StartingPrice,
						LotSold = al.Lot.Sold
					})
					.FirstOrDefaultAsync();

				if (AuctionLot == null) { return NotFound("Lot not found"); }

				if (AuctionLot.AuctioneerId == parsedUserId) { return Forbid("Access Denied: You cannot bid in your own Lot"); }

				if (AuctionLot.AuctionStatus != AuctionStatus.Active) { return BadRequest("Cannot bid on inactive auction"); }

				if (AuctionLot.LotSold) { return BadRequest("Lot has already been sold"); }

				var minimumBid = AuctionLot.LotCurrentPrice ?? AuctionLot.LotStartingPrice;

				if (bid.Amount <= minimumBid)
				{
					return BadRequest($"Bid amount must be greater than current price: {minimumBid}");
				}

				var dto = new SendBidDto
				{
					LotId = lotId,
					Amount = bid.Amount,
					BuyerId = parsedUserId,
					IsAutoBid = false
				};
				await _bidPublisher.Publish(dto);

				var autoBidService = _autoBidService;
				_ = Task.Run(async () => // Despues de procesarse una bid manual mandamos el lote para verificar si hay alguna auto bid para realizar en ese lote
				{
					await Task.Delay(500);
					await autoBidService.ProcessAutoBidAsync(lotId, bid.Amount);
				});

				return Created($"/api/lots/{lotId}", new
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
			int cantidadDePujas = 100000;
			var tasks = new List<Task>();
			var stopwatch = Stopwatch.StartNew();

			for (int i = 0; i < cantidadDePujas; i++)
			{
				var bid = new SendBidDto
				{
					LotId = lotId,
					Amount = 8000 + i,
					BuyerId = buyerId,
					IsAutoBid = false
				};

				await _bidPublisher.Publish(bid);
			}
			await Task.WhenAll(tasks);

			stopwatch.Stop();

			return Ok(new
			{
				mensaje = $"Test de concurrencia terminado en {stopwatch.ElapsedMilliseconds} ms",
				total = cantidadDePujas
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

				if (userRoleFromToken != UserRole.Auctioneer.ToString() && userIsAdmin == null || userIsAdmin == false.ToString())
				{
					return Unauthorized("Access Denied: Only Auctioneers or admins can edit Lots");
				}

				var auctionLot = await _db.AuctionLots
				.Include(al => al.Auction)
					.ThenInclude(a => a.Auctioneer)
				.Include(al => al.Lot)
					.ThenInclude(l => l.BiddingHistory)
				.FirstOrDefaultAsync(al => al.IsOriginalAuction && al.LotId == lotId);

				if (auctionLot == null)
				{
					return NotFound("Lot not found");
				}

				if (auctionLot.Auction.Auctioneer.UserId.ToString() != userIdFromToken && userIsAdmin == null || userIsAdmin == false.ToString())
				{
					return Unauthorized("Access Denied: You can only edit your own lots");
				}

				if (auctionLot.Lot.BiddingHistory != null && auctionLot.Lot.BiddingHistory.Count != 0)
				{
					return BadRequest("Cannot edit lot that already has bids");
				}

				if (auctionLot.AuctionId != editLotDto.AuctionId && userIsAdmin == null || userIsAdmin == false.ToString())
				{
					var existingAuction = await _db.Auctions
						.FirstOrDefaultAsync(a => a.Id == editLotDto.AuctionId
									&& userId == a.Auctioneer.UserId
									&& a.Status != AuctionStatus.Storage);

					if (existingAuction == null)
					{
						return BadRequest("You cannot assign an auction that is not yours. Sorry.");
					}
				}
				if (editLotDto.Image != null && editLotDto.Image.Length > 0)
				{
					string newHash;
					using var newImageStream = editLotDto.Image.OpenReadStream();
					newHash = await imageService.CalculateHashAsync(newImageStream);

					if (!string.IsNullOrEmpty(auctionLot.Lot.ImageUrl))
					{
						try
						{
							using var oldImageStream = await imageService.DownloadImageAsync(auctionLot.Lot.ImageUrl);
							var oldHash = await imageService.CalculateHashAsync(oldImageStream);

							if (newHash != oldHash)
							{
								// si son diferentes se sube la nueva imagen
								var newImageUrl = await imageService.UploadImageAsync(editLotDto.Image, "lots");
								auctionLot.Lot.ImageUrl = newImageUrl;
							}
						}
						catch
						{
							// si hay un erro al descargar la imagen anterior se sube la nueva
							var imageUrlNew = await imageService.UploadImageAsync(editLotDto.Image, "lots");
							auctionLot.Lot.ImageUrl = imageUrlNew;
						}
					}
					else
					{
						// si no habia imagen en el lote
						var nuevaUrl = await imageService.UploadImageAsync(editLotDto.Image, "lots");
						auctionLot.Lot.ImageUrl = nuevaUrl;
					}
                }

				if (editLotDto.LotNumber != auctionLot.Lot.LotNumber)
				{
					var existingLot = await _db.AuctionLots
						.Include(al => al.Lot)
						.AnyAsync(al => al.Lot.LotNumber == editLotDto.LotNumber &&
									al.AuctionId == editLotDto.AuctionId &&
									al.LotId != lotId &&
									al.IsOriginalAuction);

					if (existingLot)
					{
						return BadRequest("The Lot number is already taken in this auction");
					}
				}

				var finalAuction = await _db.Auctions.FindAsync(editLotDto.AuctionId);

				if (finalAuction == null) { return BadRequest("Auction not found. Sorry"); }

				auctionLot.Lot.Title = editLotDto.Title;
				auctionLot.Lot.LotNumber = editLotDto.LotNumber;
				auctionLot.Lot.Description = editLotDto.Description;
				auctionLot.Lot.Details = editLotDto.Details;
				auctionLot.Lot.StartingPrice = editLotDto.StartingPrice;

				if (auctionLot.Lot.BiddingHistory == null || auctionLot.Lot.BiddingHistory.Count == 0)
				{
					auctionLot.Lot.CurrentPrice = editLotDto.StartingPrice;
				}

				if (auctionLot.AuctionId != editLotDto.AuctionId) // Si se quiere cambiar de auction 
				{

					var storageAuctionLot = await _db.AuctionLots // Checkea si el lote tiene una relacion con el storage
						.Include(al => al.Auction)
						.FirstOrDefaultAsync(al =>
							al.LotId == lotId &&
							al.Auction.Status == AuctionStatus.Storage);

					if (storageAuctionLot != null)
					{
						_db.AuctionLots.Remove(storageAuctionLot); // Borramos referencia con el Storage
					}

					var exists = await _db.AuctionLots // Checkea si ya existe alguna relacion auction <-> lot con los datos del dto
						.AnyAsync(al => al.AuctionId == editLotDto.AuctionId && al.LotId == lotId);

					if (!exists) // sino existe la crea
					{
						var newAuctionLot = new AuctionLot
						{
							AuctionId = editLotDto.AuctionId,
							LotId = lotId,
							IsOriginalAuction = true,
							CreatedAt = DateTime.UtcNow,
							UpdatedAt = DateTime.UtcNow
						};

						_db.AuctionLots.Add(newAuctionLot);
					}
					else
					{
						var existingAuctionLot = await _db.AuctionLots
							.FirstAsync(al => al.AuctionId == editLotDto.AuctionId && al.LotId == lotId);

						existingAuctionLot.IsOriginalAuction = true;
						existingAuctionLot.UpdatedAt = DateTime.UtcNow;
					}
				}

				await _db.SaveChangesAsync();

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
				var userClaims = HttpContext.User;
				var userRoleFromToken = userClaims.FindFirst("Role")?.Value;
				var userIdFromToken = userClaims.FindFirst("Id")?.Value;

				if (userRoleFromToken != UserRole.Buyer.ToString())
				{
					return Unauthorized("Access Denied: Only Buyers can register Auto-bids");
				}

				if (!Guid.TryParse(userIdFromToken, out Guid parsedUserId)) { return Unauthorized("Invalid user ID"); }

				if (!ModelState.IsValid)
				{
					return BadRequest(ModelState);
				}

				var existingLot = await _db.AuctionLots
					.Include(al => al.Auction.Auctioneer)
					.Include(al => al.Lot)
					.FirstOrDefaultAsync(al => al.LotId == lotId) ?? throw new ArgumentException("Lot not found"); ;

				if (existingLot.Auction.AuctioneerId == parsedUserId) { return Unauthorized("Access Denied: Cannot Auto-bid on your own lot"); }

				var userDetails = await _db.UserDetails.FirstOrDefaultAsync(ud => ud.UserId == buyerId) ?? throw new ArgumentException("Not found"); ;

				var autoBid = await _autoBidService.CreateAutoBidAsync(userDetails.Id, lotId, dto);

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

				var success = await _autoBidService.CancelAutoBidAsync(autoBidId, parsedUserId);

				if (!success)
					return NotFound("Auto-bid not found");

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

				var auctionLot = await _db.AuctionLots
					.Include(al => al.Lot)
					.Include(al => al.Auction)
					.FirstOrDefaultAsync(al => al.LotId == lotId);

				if (auctionLot == null)
				{
					return NotFound("AuctionLot not found");
				}

				var lot = await _db.Lots.FirstOrDefaultAsync(l => l.Id == lotId);

				if (lot == null)
				{
					return NotFound("Lot not found");
				}

				if (!string.IsNullOrEmpty(lot.ImageUrl))
				{
					try
					{
						await imageService.DeleteImageAsync(lot.ImageUrl);
					}
					catch (Exception ex)
					{
						Console.WriteLine($"Error al borrar la imagen: {ex.Message}");
					}
				}

				if (auctionLot.Auction.Status != AuctionStatus.Closed)
				{
					_db.AuctionLots.Remove(auctionLot);
					_db.Lots.Remove(lot);
					await _db.SaveChangesAsync();
				}

				await transaction.CommitAsync();

				return Ok(new { message = "Lot deleted successfully" });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}
	}
}
	