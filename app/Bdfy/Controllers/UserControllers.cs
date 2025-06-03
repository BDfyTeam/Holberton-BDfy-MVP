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
                        var detailsAuctioneer = new AuctioneerDetails
                        {
                            UserId = user.Id,
                            Plate = AuctioneerObject.Plate 
                        };
                        
                        await transaction.CommitAsync();
                        db.AuctioneerDetails.Add(detailsAuctioneer);
                        await db.SaveChangesAsync();

                        return Created();
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
        // [HttpPost("login")]
        // public async Task<ActionResult> Login([FromBody] LoginUserDto Dto, BDfyDbContext db)
        // {
        //     try
        //     {
        //         if (!ModelState.IsValid)
        //         {
        //             return BadRequest(ModelState);
        //         }
        //         var email = await db.Users.FindAsync(Dto.Email);

        //         if (email == null) { return NotFound("Email not found."); }
        //         else
        //         {

        //         }

                


        //     }
        //     catch (Exception ex)
        //     {
        //     }
        //     ;  
        // }
        
				 //1-Validar Modelo -checked
				// 2-verificar si el email que llega existe en la db -checked
				// -si esta seguimos
				// -en caso que no error
				// 3-generar el claim del jwt token
				// 4-retornar jwt token
    }

}
