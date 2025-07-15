using Microsoft.AspNetCore.Mvc;
using BDfy.Dtos;
using BDfy.Data;
using BDfy.Models;
using BDfy.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using System.Dynamic;

namespace BDfy.Controllers
{
    [ApiController]
    [Route("api/1.0/users")]
    public class BaseController(BDfyDbContext db) : ControllerBase { protected readonly BDfyDbContext _db = db; }

    public class UsersController(BDfyDbContext db, GcsImageService imageService, UserServices userServices) : BaseController(db)
    {
        private GcsImageService _imgService = imageService;

        [EnableRateLimiting("register_policy")]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            try
            {
                var token = await userServices.Register(dto);
                return Ok(new { Token = token });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }

        [EnableRateLimiting("register_policy")]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUserDto dto)
        {
            try
            {
                var token = await userServices.Login(dto);
                return Ok(new { Token = token });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserById([FromRoute] Guid userId)
        {
            try
            {
                var user = await userServices.GetUserById(userId);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }

        [HttpGet("_internal")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await userServices.GetAllUsers();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }

        [Authorize]
        [HttpPut("{auctioneerId}")]

        public async Task<IActionResult> EditAuctioneer([FromForm] EditAuctioneerDto dto, [FromRoute] Guid auctioneerId)
        {
            try
            {
                await userServices.EditAuctioneer(dto, auctioneerId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }

        [Authorize]
        [HttpPut("{userId}/deactivate-account")]
        public async Task<IActionResult> DeleteUser([FromRoute] Guid userId)
        {
            try
            {
                var userClaims = HttpContext.User;
                var userIdFromToken = userClaims.FindFirst("Id")?.Value;
                if (userIdFromToken != userId.ToString()) { return Forbid("Diffrent user as the login"); }
                await userServices.DeleteUser(userId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }
  
    }

}