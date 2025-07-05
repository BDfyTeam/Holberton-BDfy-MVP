using Microsoft.AspNetCore.Mvc;
using BDfy.Dtos;
using BDfy.Data;
using BDfy.Models;
using BDfy.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;

namespace BDfy.Controllers
{
    [ApiController]
    [Route("api/1.0/users")]
    public class BaseController(BDfyDbContext db) : ControllerBase { protected readonly BDfyDbContext _db = db; }

    public class UsersController(BDfyDbContext db, Storage storageService, [FromServices] GenerateJwtToken jwtService, GcsImageService imageService) : BaseController(db)
    {
        private readonly Storage _storageService = storageService;
        private GcsImageService _imgService = imageService;

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
                IsActive = true,
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
                    IsAdmin = details.IsAdmin,
                    IsVerified = details.IsVerified
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
                    Plate = details.Plate,
                    AuctionHouse = details.AuctionHouse
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

            var token = jwtService.GenerateJwt(user);

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

            var token = jwtService.GenerateJwt(user);
            return Ok(new { Token = token });
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserById([FromRoute] Guid userId)
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

        public async Task<IActionResult> EditAuctioneer([FromForm] EditAuctioneerDto dto, [FromRoute] Guid auctioneerId)
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
                    .Include(u => u.AuctioneerDetails)
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

                if (dto.AuctionHouse != null && auctioneer.AuctioneerDetails != null)
                {
                    auctioneer.AuctioneerDetails.AuctionHouse = dto.AuctionHouse;
                }

                if (dto.Image != null && dto.Image.Length > 0)
                {
                    if (auctioneer.ImageUrl != null)
                    {
                        var newHash = await _imgService.CalculateHashAsync(dto.Image.OpenReadStream()); // Calcula hash de la nueva imagen
                        var oldStream = await _imgService.DownloadImageAsync(auctioneer.ImageUrl); // Descarga la imagen del subastador
                        var oldHash = await _imgService.CalculateHashAsync(oldStream); // Calcula hash de la imagen del subastador

                        if (newHash != oldHash) // Compara hashs ---> si son diferentes significa que es otra imagen
                        {
                            await _imgService.DeleteImageAsync(auctioneer.ImageUrl); // Borra la anituga foto
                            auctioneer.ImageUrl = await _imgService.UploadImageAsync(dto.Image, "users"); // Actualiza a la nueva imagen
                        }
                    }
                    else
                    {
                        auctioneer.ImageUrl = await _imgService.UploadImageAsync(dto.Image, "users"); // Si el subastador no tenia imagen sube la neuva foto
                    }
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

        [Authorize]
        [HttpPut("{userId}/deactivate-account")]
        public async Task<IActionResult> DeleteUser([FromRoute] Guid userId)
        {
            try
            {
                var userClaims = HttpContext.User;
                var userIdFromToken = userClaims.FindFirst("Id")?.Value;

                if (userIdFromToken != userId.ToString())
                {
                    return Forbid("Diffrent user as the login");
                }
                
                var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    return NotFound("The povide User does not exist");
                }

                user.IsActive = false;
                await _db.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
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