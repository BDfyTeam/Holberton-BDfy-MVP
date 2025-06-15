using Microsoft.AspNetCore.Mvc;
using BDfy.Dtos;
using BDfy.Data;
using BDfy.Models;
using BDfy.Services;
using BDfy.Configurations;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Identity;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Xml;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Authorization;

namespace BDfy.Controllers
{
    [ApiController]
    [Route("api/1.0/users")]
    public class BaseController(BDfyDbContext db) : ControllerBase { protected readonly BDfyDbContext _db = db; }

    public class UsersController(BDfyDbContext db, Storage storageService, IOptions<AppSettings> appSettings) : BaseController(db)
    {
        private readonly Storage _storageService = storageService;
        private readonly string _secretKey = appSettings.Value.SecretKey;

        [EnableRateLimiting("register_policy")]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            using var transaction = await _db.Database.BeginTransactionAsync();

            if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest($"Email {dto.Email} is already registered.");

            if (await _db.Users.AnyAsync(u => u.Ci == dto.Ci))
                return BadRequest($"CI {dto.Ci} is already registered.");

            // var passwordHasher = new PasswordHasher<User>();
            var PasswordHashed = PasswordHasher.Hash(dto.Password);
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
                Password = PasswordHashed
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
                var storageAuction = await _storageService.CreateStorage(user.Id); // Storage para auctioneer
                _db.Auctions.Add(storageAuction);
            }
            else
            {
                return BadRequest("Missing user details for the specified role");
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
                return NotFound("User not found");

            var result = PasswordHasher.Verify(dto.Password, user.Password);

            if (!result) { return Unauthorized("Invalid password"); }

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

        [Authorize]
        [HttpPut("{auctioneerId}")]

        public async Task<IActionResult> EditAuctioneer([FromBody] EditAuctioneerDto dto, [FromRoute] Guid auctioneerId)
        {
            try
            {
                if (!ModelState.IsValid) { return BadRequest("At least one thing to edit"); }

                var AuctioneerClaims = HttpContext.User;
                var AuctioneerRoleFromToken = AuctioneerClaims.FindFirst("Role")?.Value;
                var AuctioneerIdFromToken = AuctioneerClaims.FindFirst("Id")?.Value;

                if (AuctioneerIdFromToken != auctioneerId.ToString()) { return Unauthorized("You do not have permission."); }

                if (AuctioneerRoleFromToken != UserRole.Auctioneer.ToString())
                { return Unauthorized("Only auctioneers can edit their profile."); }

                var auctioneer = await _db.Users
                    .FirstOrDefaultAsync(u => u.Id == auctioneerId);

                if (auctioneer == null) { return NotFound("Auctioneer do not exist in our registry."); }

                bool hasChanges = !string.IsNullOrWhiteSpace(dto.Email) ||
                                    !string.IsNullOrWhiteSpace(dto.Password) ||
                                    !string.IsNullOrWhiteSpace(dto.Phone) ||
                                    dto.Direction != null;

                if (!hasChanges) { return BadRequest("At least one field must be provided for update."); }

                if (!string.IsNullOrWhiteSpace(dto.Email))
                {

                    if (!IsValidEmail(dto.Email))
                    {
                        return BadRequest("Invalid email format.");
                    }


                    var emailExists = await _db.Users
                        .AnyAsync(u => u.Email == dto.Email && u.Id != auctioneerId);

                    if (emailExists)
                    {
                        return BadRequest("Email is already in use by another user.");
                    }

                    auctioneer.Email = dto.Email;
                }

                if (!string.IsNullOrWhiteSpace(dto.Password))
                {

                    if (dto.Password.Length < 8 || dto.Password.Length > 20)
                    {
                        return BadRequest("Password must be between 8 and 20 characters.");
                    }

                    bool hasLowerCase = dto.Password.Any(char.IsLower);
                    bool hasUpperCase = dto.Password.Any(char.IsUpper);
                    bool hasDigit = dto.Password.Any(char.IsDigit);

                    if (!hasLowerCase || !hasUpperCase || !hasDigit)
                    {
                        return BadRequest("Password must include at least one uppercase letter, one lowercase letter, and one number.");
                    }


                    var passwordHasher = new PasswordHasher<User>();
                    auctioneer.Password = passwordHasher.HashPassword(auctioneer, dto.Password);
                }

                if (!string.IsNullOrWhiteSpace(dto.Phone))
                {
                    auctioneer.Phone = dto.Phone;
                }


                if (dto.Direction != null)
                {

                    if (auctioneer.Direction == null)
                    {
                        auctioneer.Direction = new Direction();
                    }

                    if (!string.IsNullOrWhiteSpace(dto.Direction.Street))
                    {
                        auctioneer.Direction.Street = dto.Direction.Street;
                    }

                    if (!string.IsNullOrWhiteSpace(dto.Direction.Corner))
                    {
                        auctioneer.Direction.Corner = dto.Direction.Corner;
                    }

                    if (dto.Direction.StreetNumber > 0)
                    {
                        auctioneer.Direction.StreetNumber = dto.Direction.StreetNumber;
                    }

                    if (dto.Direction.ZipCode > 0)
                    {
                        auctioneer.Direction.ZipCode = dto.Direction.ZipCode;
                    }

                    if (!string.IsNullOrWhiteSpace(dto.Direction.Department))
                    {
                        auctioneer.Direction.Department = dto.Direction.Department;
                    }
                }

                await _db.SaveChangesAsync();
                return NoContent();
            }

            catch (Exception ex) { return StatusCode(500, "Internal Server Error: " + ex.Message); }
        }

        // 🔒 Método privado para generar el JWT
        private string GenerateJwt(User user)
        {
            var claims = new List<Claim>
            {
                new("Id", user.Id.ToString()),
                new("Email", user.Email),
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
        
        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

    }

}