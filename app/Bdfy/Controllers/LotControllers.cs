using BDfy.Dtos;
using Microsoft.AspNetCore.Mvc;
using BDfy.Data;

namespace BDfy.Controllers
{
    [ApiController]
    [Route("api/1.0/auctions")]
    public class BasaeController(BDfyDbContext db) : Controller // Para no tener que instanciar la db en los endpoints
    {
        protected readonly BDfyDbContext _db = db; // La db
    }
    public class LotsController(BDfyDbContext db) : BaseController(db)
    {
        [HttpPost(": {UserId}")]
        public async Task<ActionResult> RegisterDto(Guid UserID, [FromBody] RegisterAuctionDto Dto)
        {
            var user = await
        }
    }
}