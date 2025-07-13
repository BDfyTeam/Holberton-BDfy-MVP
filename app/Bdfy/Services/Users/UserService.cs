using BDfy.Models;
using BDfy.Data;
using BDfy.Dtos;
using Microsoft.EntityFrameworkCore;

namespace BDfy.Services
{
    public class UserServices(BDfyDbContext db, GcsImageService imageService, Storage storage, GenerateJwtToken generateJwtToken, PasswordHasher passwordHasher)
    {
        private GcsImageService _imgService = imageService;
        private Storage _storageService = storage;
        private GenerateJwtToken jwtService = generateJwtToken;
        private PasswordHasher _psHasher = passwordHasher;

        public async Task<string> Register(RegisterDto dto)
        {
            using var transaction = await db.Database.BeginTransactionAsync();

            if (await db.Users.AnyAsync(u => u.Email == dto.Email))
                throw new BadRequestException($"Email {dto.Email} is already registered.");

            if (await db.Users.AnyAsync(u => u.Ci == dto.Ci))
                throw new BadRequestException($"CI {dto.Ci} is already registered.");

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

            db.Users.Add(user);
            await db.SaveChangesAsync();


            if (dto.Role == UserRole.Buyer && dto.UserDetails != null)
            {
                var details = dto.UserDetails; // No es necesario deserializar, ya que es un objeto específico
                db.UserDetails.Add(new UserDetails
                {
                    UserId = user.Id,
                    IsAdmin = details.IsAdmin,
                    IsVerified = details.IsVerified
                });
            }
            else if (dto.Role == UserRole.Auctioneer && dto.AuctioneerDetails != null)
            {
                var details = dto.AuctioneerDetails; // No es necesario deserializar, ya que es un objeto específico
                if (await db.AuctioneerDetails.AnyAsync(ad => ad.Plate == details.Plate)) { throw new BadRequestException("Plate is already in use."); }

                db.AuctioneerDetails.Add(new AuctioneerDetails
                {
                    UserId = user.Id,
                    Plate = details.Plate,
                    AuctionHouse = details.AuctionHouse
                });
                var storageAuction = await _storageService.CreateStorage(user.Id); // Storage para auctioneer
                db.Auctions.Add(storageAuction);
            }
            else
            {
                throw new BadRequestException("Missing user details for the specified role");
            }

            await db.SaveChangesAsync();
            await transaction.CommitAsync();

            var token = jwtService.GenerateJwt(user);

            return token;
        }
        public async Task<string> Login(LoginUserDto dto)
        {
            var user = await db.Users
                .Include(u => u.UserDetails)
                .Include(u => u.AuctioneerDetails)
                .FirstOrDefaultAsync(u => u.Email == dto.Email) ?? throw new NotFoundException("User not found");

            var result = PasswordHasher.Verify(dto.Password, user.Password);

            if (!result) { throw new UnauthorizedException("Invalid password"); }

            var token = jwtService.GenerateJwt(user);

            return token;
        }

        public async Task<UserDto> GetUserById(Guid userId)
        {
            var user = await db.Users
               .Include(u => u.UserDetails)
               .Include(u => u.AuctioneerDetails)
               .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive) ?? throw new NotFoundException("User not found");

            if (user.UserDetails != null)
            {
                var userDto = new UserDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Password = user.Password,
                    Ci = user.Ci,
                    Reputation = user.Reputation,
                    Phone = user.Phone,
                    Role = user.Role,
                    ImageUrl = user.ImageUrl,
                    Direction = new DirectionDto
                    {
                        Street = user.Direction.Street,
                        StreetNumber = user.Direction.StreetNumber,
                        Corner = user.Direction.Corner,
                        ZipCode = user.Direction.ZipCode,
                        Department = user.Direction.Department
                    },
                    IsActive = user.IsActive,
                    UserDetails = new UserDetailsDto
                    {
                        IsAdmin = user.UserDetails.IsAdmin,
                        IsVerified = user.UserDetails.IsVerified
                    }
                };
                return userDto;
            }
            else if (user.AuctioneerDetails != null)
            {
                var userDto = new UserDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Password = user.Password,
                    Ci = user.Ci,
                    Reputation = user.Reputation,
                    Phone = user.Phone,
                    Role = user.Role,
                    ImageUrl = user.ImageUrl,
                    Direction = new DirectionDto
                    {
                        Street = user.Direction.Street,
                        StreetNumber = user.Direction.StreetNumber,
                        Corner = user.Direction.Corner,
                        ZipCode = user.Direction.ZipCode,
                        Department = user.Direction.Department
                    },
                    IsActive = user.IsActive,
                    AuctioneerDetails = new AuctioneerDetailsDto
                    {
                        Plate = user.AuctioneerDetails.Plate,
                        AuctionHouse = user.AuctioneerDetails.AuctionHouse
                    }
                };
                return userDto;
            }
            return new UserDto { };
        }

        public async Task<IEnumerable<UserDto>> GetAllUsers()
        {
            var users = await db.Users
                .Include(u => u.UserDetails)
                .Include(u => u.AuctioneerDetails)
                .ToListAsync();

            var usersDto = users.Select(u => new UserDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Password = u.Password,
                Ci = u.Ci,
                Reputation = u.Reputation,
                Phone = u.Phone,
                Role = u.Role,
                ImageUrl = u.ImageUrl,
                Direction = new DirectionDto
                {
                    Street = u.Direction.Street,
                    StreetNumber = u.Direction.StreetNumber,
                    Corner = u.Direction.Corner,
                    ZipCode = u.Direction.ZipCode,
                    Department = u.Direction.Department
                },
                IsActive = u.IsActive,
                UserDetails = u.UserDetails is not null
                        ? new UserDetailsDto
                        {
                            IsAdmin = u.UserDetails.IsAdmin,
                            IsVerified = u.UserDetails.IsVerified
                        }
                        : null,
                AuctioneerDetails = u.AuctioneerDetails is not null
                        ? new AuctioneerDetailsDto
                        {
                            Plate = u.AuctioneerDetails.Plate,
                            AuctionHouse = u.AuctioneerDetails.AuctionHouse
                        }
                        : null
            }).ToList();

            return usersDto;
        }

        public async Task EditAuctioneer(EditAuctioneerDto dto, Guid auctioneerId)
        {
            var auctioneer = await db.Users
                    .Include(u => u.AuctioneerDetails)
                    .FirstOrDefaultAsync(u => u.Id == auctioneerId) ?? throw new NotFoundException("Auctioneer do not exist in our registry.");

            bool hasChanges = !string.IsNullOrWhiteSpace(dto.Email)
                || !string.IsNullOrWhiteSpace(dto.Password)
                || !string.IsNullOrWhiteSpace(dto.Phone)
                || dto.Direction != null;

            if (!hasChanges) { throw new BadRequestException("At least one field must be provided for update."); }

            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                if (!IsValidEmail(dto.Email))
                {
                    throw new BadRequestException("Invalid email format.");
                }

                var emailExists = await db.Users
                    .AnyAsync(u => u.Email == dto.Email && u.Id != auctioneerId);

                if (emailExists)
                {
                    throw new BadRequestException("Email already in use");
                }
                auctioneer.Email = dto.Email;
            }

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {

                if (dto.Password.Length < 8 || dto.Password.Length > 20)
                {
                    throw new BadRequestException("Password must be between 8 and 20 characters.");
                }

                bool hasLowerCase = dto.Password.Any(char.IsLower);
                bool hasUpperCase = dto.Password.Any(char.IsUpper);
                bool hasDigit = dto.Password.Any(char.IsDigit);

                if (!hasLowerCase || !hasUpperCase || !hasDigit)
                {
                    throw new BadRequestException("Password must include at least one uppercase letter, one lowercase letter, and one number.");
                }
                auctioneer.Password = PasswordHasher.Hash(dto.Password);
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
                    auctioneer.ImageUrl = await _imgService.UploadImageAsync(dto.Image, "users"); // Si el subastador no tenia imagen sube la nueva foto
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
            await db.SaveChangesAsync();
        }
        public async Task DeleteUser(Guid userId)
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId) ?? throw new NotFoundException("The povide User does not exist");
            user.IsActive = false;
            await db.SaveChangesAsync();
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