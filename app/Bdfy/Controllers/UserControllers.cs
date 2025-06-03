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


namespace BDfy.Controllers
{
    [ApiController]
    [Route("api/1.0/users")]

    public class UsersController : ControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult> Register([FromBody] RegisterDto Dto, BDfyDbContext db)
        {
            try
            {
                using var transaction = await db.Database.BeginTransactionAsync();


                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var emailCheck = await db.Users.FirstOrDefaultAsync(u => u.Email == Dto.Email);

                var ci = await db.Users.FirstOrDefaultAsync(u => u.Ci == Dto.Ci);

                if (emailCheck != null || ci != null)
                {
                    string duplicate = "";

                    if (emailCheck != null)
                    {
                        duplicate += $"email {Dto.Email}";
                    }

                    if (ci != null )
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
                    Reputation = 75,
                    Direction = Dto.Direction,
                };
                user.Password = passwordHasher.HashPassword(user, Dto.Password);

                db.Users.Add(user);
                await db.SaveChangesAsync();

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
                    audience: "http://localhost:5015/api/1.0/users/register",
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
                        var detailsUser = new UserDetails //instanciamos userdetails para crear los details
                        {
                            UserId = user.Id, //le asigno el user id generado en la instancia user
                            IsAdmin = UserObject.IsAdmin //El objeto que deserialize tiene si es admin o no
                        };

                        db.UserDetails.Add(detailsUser);
                        await db.SaveChangesAsync();
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
                        var auctioneerDetailsCheck = await db.AuctioneerDetails.FirstOrDefaultAsync(ad => ad.Plate == AuctioneerObject.Plate); // si el plate esta en la db guarda el auctioneer details
                        
                        if (auctioneerDetailsCheck != null) { return BadRequest("Plate already in use"); }

                        else
                        {
                            var detailsAuctioneer = new AuctioneerDetails
                            {
                                UserId = user.Id,
                                Plate = AuctioneerObject.Plate
                            };

                            await transaction.CommitAsync();
                            db.AuctioneerDetails.Add(detailsAuctioneer);
                            await db.SaveChangesAsync();

                            return Ok(new { Token = tokenString });
                        }
                    }
                    else { return BadRequest("Error: Auctioneer details missing"); }
                }
                await db.SaveChangesAsync();
                await transaction.CommitAsync();
                return (ActionResult)Results.Created();

            }
            catch (Exception ex) //
            {
                var errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return BadRequest($"Error inesperado al crear usuario: {errorMessage}");
            }


        }
        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginUserDto Dto, BDfyDbContext db)
        {
            try
            {
                if (!ModelState.IsValid) // Reviso el modelo
                {
                    return BadRequest(ModelState);
                }
                if (Dto.Email == null) { return BadRequest("You must put a email"); } //Revisa que no este vacio
                if (Dto.Password == null) { return BadRequest("You must put a password"); } // IDEM

                var user = await db.Users //instancio el usuario para agarrar los user details y los auctioneer details para determinar que hacer segun el rol
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
            catch (Exception ex) //
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
    }   

}
