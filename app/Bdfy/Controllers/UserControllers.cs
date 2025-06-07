using Microsoft.AspNetCore.Mvc;
using BDfy.Dtos;
using BDfy.Data;
using BDfy.Models;
using BDfy.Services;
using BDfy.Configurations;
using Microsoft.Extensions.Options;
using System.Text.Json;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Identity;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;

namespace BDfy.Controllers
{
    [ApiController]
    [Route("api/1.0/users")]
    public class BaseController(BDfyDbContext db) : ControllerBase
    {
        protected readonly BDfyDbContext _db = db;
    }

    public class UsersController : BaseController
    {
        private readonly Storage _storageService;
        private readonly string _secretKey;

        public UsersController(BDfyDbContext db, Storage storageService, IOptions<AppSettings> appSettings)
            : base(db)
        {
            _storageService = storageService;
            _secretKey = appSettings.Value.SecretKey;
        }

        [EnableRateLimiting("register_policy")]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            using var transaction = await _db.Database.BeginTransactionAsync();

            if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest($"Email {dto.Email} is already registered.");

            if (await _db.Users.AnyAsync(u => u.Ci == dto.Ci))
                return BadRequest($"CI {dto.Ci} is already registered.");

            var passwordHasher = new PasswordHasher<User>();
            var user = new User
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Phone = dto.Phone,
                Ci = dto.Ci,
                Role = dto.Role,
                Reputation = dto.Reputation,
                Direction = dto.Direction,
                Password = passwordHasher.HashPassword(null!, dto.Password)
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();


            if (dto.Role == UserRole.Buyer && dto.UserDetails != null)
            {
                var details = dto.UserDetails; // No es necesario deserializar, ya que es un objeto específico
                _db.UserDetails.Add(new UserDetails
                {
                    UserId = user.Id,
                    IsAdmin = details.IsAdmin
                });
            }
            else if (dto.Role == UserRole.Auctioneer && dto.AuctioneerDetails != null)
            {
                var details = dto.AuctioneerDetails; // No es necesario deserializar, ya que es un objeto específico
                if (await _db.AuctioneerDetails.AnyAsync(ad => ad.Plate == details.Plate))
                    return BadRequest("Plate is already in use.");
                _db.AuctioneerDetails.Add(new AuctioneerDetails
                {
                    UserId = user.Id,
                    Plate = details.Plate
                });
                var storageAuction = await _storageService.CreateStorage(user.Id);
                _db.Auctions.Add(storageAuction);
            }
            else
            {
                return BadRequest("Missing user details for the specified role.");
            }

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            var token = GenerateJwt(user);

            return Ok(new { Token = token });
        }

        [EnableRateLimiting("register_policy")]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUserDto dto)
        {
            var user = await _db.Users
                .Include(u => u.UserDetails)
                .Include(u => u.AuctioneerDetails)
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user is null)
                return Unauthorized("Invalid credentials.");

            var passwordHasher = new PasswordHasher<User>();
            var result = passwordHasher.VerifyHashedPassword(user, user.Password, dto.Password);

            if (result == PasswordVerificationResult.Failed)
                return Unauthorized("Invalid password.");

            var token = GenerateJwt(user);
            return Ok(new { Token = token });
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserById(Guid userId)
        {
            var user = await _db.Users
                .Include(u => u.UserDetails)
                .Include(u => u.AuctioneerDetails)
                .FirstOrDefaultAsync(u => u.Id == userId);

            return user is null ? NotFound() : Ok(user);
        }

        [HttpGet("_internal")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _db.Users
                .Include(u => u.UserDetails)
                .Include(u => u.AuctioneerDetails)
                .ToListAsync();

            return Ok(users);
        }

        // 🔒 Método privado para generar el JWT
        private string GenerateJwt(User user)
        {
            var claims = new List<Claim>
            {
                new("Id", user.Id.ToString()),
                new("email", user.Email),
                new("Role", user.Role.ToString())
            };

            if (user.UserDetails is not null)
            {
                claims.Add(new Claim("IsAdmin", user.UserDetails.IsAdmin.ToString()));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: "http://localhost:5015",
                audience: "http://localhost:5015/api/1.0/users",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
