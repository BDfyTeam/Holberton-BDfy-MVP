using Microsoft.AspNetCore.Mvc;
using BDfy.Dtos;
using BDfy.Data;
using BDfy.Models;
using System.Text.Json;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Identity;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;


namespace BDfy.Controllers
{
    [ApiController]
    [Route("api/1.0/users")]
    public class BaseController(BDfyDbContext db) : Controller // Para no tener que instanciar la db en los endpoints
    {
        protected readonly BDfyDbContext _db = db; // La db
    }
    public class UsersController(BDfyDbContext db) : BaseController(db) // Heredamos la DB para poder usarla
    {
        [HttpPost("register")]
        public async Task<ActionResult> Register([FromBody] RegisterDto Dto)
        {
            try
            {
                using var transaction = await _db.Database.BeginTransactionAsync();


                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var emailCheck = await _db.Users.FirstOrDefaultAsync(u => u.Email == Dto.Email);

                var ci = await _db.Users.FirstOrDefaultAsync(u => u.Ci == Dto.Ci);

                if (emailCheck != null || ci != null)
                {
                    string duplicate = "";

                    if (emailCheck != null)
                    {
                        duplicate += $"email {Dto.Email}";
                    }

                    if (ci != null)
                    {
                        if (duplicate != "") duplicate += " and ";
                        duplicate += $"CI {Dto.Ci}";

                        return BadRequest($"The {duplicate} is already registered");
                    }
                }
                //Lo creo porque al instanciarlo generamos un id unico, que luego usamos en userdetails.
                var passwordHasher = new PasswordHasher<User>();
                var user = new User
                {
                    FirstName = Dto.FirstName,
                    LastName = Dto.LastName,
                    Email = Dto.Email,
                    Phone = Dto.Phone,
                    Ci = Dto.Ci,
                    Role = Dto.Role,
                    Reputation = Dto.Reputation, // Se setea desde el front segun que formulario se seleccione (User(Buyer) = 75%, User(Auctioneer) 100%)
                    Direction = Dto.Direction,
                };

                user.Password = passwordHasher.HashPassword(user, Dto.Password);

                _db.Users.Add(user);
                await _db.SaveChangesAsync();



                var claims = new List<Claim> //genera los claims mapeados a los de user
                {
                    new("Role", user.Role.ToString()),
                    new("Id", user.Id.ToString()),
                    new("email", user.Email)
                };

                string _secretKey = "iMpoSIblePASSword!!!8932!!!!!!!!!!!!!!!!!!!!!!!!!!!!"; //key secreta para el token para todos

                var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey)); //Paso la secret key que es un string a bytes

                var signinCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);//Genero las credencial con un algoritmo

                var tokeOptions = new JwtSecurityToken(//parametros que queremos guardar en el jwt token
                    issuer: "http://localhost:5015",
                    audience: "http://localhost:5015/api/1.0/users",
                    claims: claims,
                    expires: DateTime.Now.AddMinutes(60),
                    signingCredentials: signinCredentials
                );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(tokeOptions);

                if (Dto.Role == UserRole.Buyer && Dto.Details != null)
                {
                    var UserObject = ((JsonElement)Dto.Details).Deserialize<UserDetailsDto>(); //deserializo el json a objecta para poder utlizarlo

                    if (UserObject != null) //Verifico que el objeto no sean nulo
                    {

                        var DetailsDto = new UserDetailsDto // Para engañar a la validacion (chanchada cambiar jiji)
                        {
                            IsAdmin = UserObject.IsAdmin,
                            UserId = user.Id
                        };

                        if (!TryValidateModel(DetailsDto)) { return BadRequest(ModelState); } // Asi si usa las annotations del modelo

                        var detailsUser = new UserDetails //instanciamos userdetails para crear los details
                        {
                            UserId = DetailsDto.UserId, //le asigno el user id generado en la instancia user
                            IsAdmin = DetailsDto.IsAdmin //El objeto que deserialize tiene si es admin o no
                        };

                        _db.UserDetails.Add(detailsUser);
                        await _db.SaveChangesAsync();
                        await transaction.CommitAsync();

                        return Ok(new { Token = tokenString });

                    }
                    else { return BadRequest("Error: User details missing"); }
                }

                else if (Dto.Role == UserRole.Auctioneer && Dto.Details != null) //Validacion segun roles
                {
                    var AuctioneerObject = ((JsonElement)Dto.Details).Deserialize<AuctioneerDetailsDto>(); //deserializo de json a objeto para poder utlizarlo
                    if (AuctioneerObject != null) //verifico que el objeto no sea nulo
                    {
                        var auctioneerDetailsCheck = await _db.AuctioneerDetails.FirstOrDefaultAsync(ad => ad.Plate == AuctioneerObject.Plate); // si el plate esta en la _db guarda el auctioneer details

                        if (auctioneerDetailsCheck != null) { return BadRequest("Plate already in use"); }

                        else
                        {
                            var DetailsDto = new AuctioneerDetailsDto // Para engañar a la validacion (chanchada cambiar jiji)
                            {
                                Plate = AuctioneerObject.Plate,
                                UserId = user.Id
                            };

                            if (!TryValidateModel(DetailsDto)) { return BadRequest(ModelState); } // Asi si usa las annotations del modelo

                            var detailsAuctioneer = new AuctioneerDetails
                            {
                                UserId = user.Id,
                                Plate = DetailsDto.Plate
                            };

                            await transaction.CommitAsync();
                            _db.AuctioneerDetails.Add(detailsAuctioneer);
                            await _db.SaveChangesAsync();

                            return Ok(new { Token = tokenString });
                        }
                    }
                    else { return BadRequest("Error: Auctioneer details missing"); }
                }
                await _db.SaveChangesAsync();
                await transaction.CommitAsync();
                return (ActionResult)Results.Created();

            }
            catch (Exception ex)
            {
                var errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return BadRequest($"Error inesperado al crear usuario: {errorMessage}");
            }
        }
        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginUserDto Dto)
        {
            try
            {
                if (!ModelState.IsValid) // Reviso el modelo
                {
                    return BadRequest(ModelState);
                }
                if (Dto.Email == null) { return BadRequest("You must put a email"); } //Revisa que no este vacio
                if (Dto.Password == null) { return BadRequest("You must put a password"); } // IDEM

                var user = await _db.Users //instancio el usuario para agarrar los user details y los auctioneer details para determinar que hacer segun el rol
                    .Include(u => u.UserDetails) //Es db.include
                    .Include(u => u.AuctioneerDetails)
                    .FirstOrDefaultAsync(u => u.Email == Dto.Email) ?? throw new InvalidOperationException("User not found"); // Si es false el first or default tira un error usando el operador ternario ??

                var passwordHasher = new PasswordHasher<User>();
                var passDehashed = passwordHasher.VerifyHashedPassword(user, user.Password, Dto.Password); //Compara la pass de user contra el dto que llega del front

                if (passDehashed == PasswordVerificationResult.Failed) //revisa que la password dehasheada no haya fallado
                {
                    return Unauthorized("Invalid password");
                }

                var claims = new List<Claim> //genera los claims mapeados a los de user
                {
                    new("Id", user.Id.ToString()),
                    new("email", user.Email),
                    new("Role", user.Role.ToString())

                };

                string _secretKey = "iMpoSIblePASSword!!!8932!!!!!!!!!!!!!!!!!!!!!!!!!!!!"; //key secreta para el token para todos

                var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey)); //Paso la secret key que es un string a bytes

                var signinCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);//Genero las credencial con un algoritmo

                var tokeOptions = new JwtSecurityToken(//parametros que queremos guardar en el jwt token
                issuer: "http://localhost:5015",
                audience: "http://localhost:5015/api/1.0/users/login",
                claims: claims,
                expires: DateTime.Now.AddMinutes(60),
                signingCredentials: signinCredentials
                );
                var tokenString = new JwtSecurityTokenHandler().WriteToken(tokeOptions);

                if (user.Role == UserRole.Buyer)
                {
                    if (user.UserDetails != null)
                    {
                        claims.Add(new Claim("IsAdmin", user.UserDetails.IsAdmin.ToString()));
                    }
                    return Ok(new { Token = tokenString });
                }

                else if (user.Role == UserRole.Auctioneer) return Ok(new { Token = tokenString });

                return Ok();
            }
            catch (Exception ex)
            {
                var errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return BadRequest($"Error inesperado al crear usuario: {errorMessage}");
            }
        }
        // [Authorize]
        // [HttpPut("{userId}/edit")]
        // public async Task<ActionResult> Update(Guid userID, [FromBody] EditUserDto Dto, BDfyDbContext db)
        // {
        //     var userClaims = HttpContext.User;
        //     var userIdFromToken = userClaims.FindFirst("id")?.Value;

        //     if (!ModelState.IsValid) // Reviso el modelo
        //     {
        //         return BadRequest(ModelState);
        //     }

        //     if (userIdFromToken != userID.ToString())
        //     {
        //         return Unauthorized("Permission denied.");
        //     }

        //     var user = await db.Users.FindAsync(userID);

        //     if (user == null) { return BadRequest(); }
        //     user.Ci = Dto.Ci;


        // }

    // Get User by ID
        [HttpGet("{userId}")]
        public async Task<ActionResult<User>> GetUserById(Guid userId)
        {
            try
            {
                var user = await _db.Users
                        .Include(ud => ud.UserDetails)
                        .Include(ad => ad.AuctioneerDetails)
                        .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    return NotFound();
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }

        // GET all users
        [HttpGet ("_internal")]
        public async Task<ActionResult<IEnumerable<User>>> GetAllUsers()
        {
            try
            {
                var users = await _db.Users
                    .Include(ud => ud.UserDetails)
                    .ToListAsync();
                
                return Ok(users);
            }
            catch (Exception ex)
            {
                
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
    }

    private ActionResult<IEnumerable<User>> Ok(List<User> users, List<User> auctioneers)
    {
      throw new NotImplementedException();
    }
  }

        

}
