using Microsoft.AspNetCore.Mvc;
using BDfy.Dtos;
using System.Data.Common;
using BDfy.Data;
using BDfy.Models;
using System.Text.Json;

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
                var user = new User
                {
                    FirstName = Dto.FirstName,
                    LastName = Dto.LastName,
                    Email = Dto.Email,
                    Password = Dto.Password,
                    Ci = Dto.Ci,
                    Phone = Dto.Phone,
                    Role = Dto.Role,
                    Reputation = 75,
                    Direction = Dto.Direction,
                };

                db.Users.Add(user);
                await db.SaveChangesAsync();


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
                        return Created();

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
                            //UserId = user.Id,
                            // Plate = AuctioneerObject.Plate 
                        };
                        db.AuctioneerDetails.Add(detailsAuctioneer);
                        await db.SaveChangesAsync();
                        return Created();
                    }
                    else { return BadRequest("Error: Auctioneer details missing"); }
                }
                return BadRequest("Error: Invalid user role or details missing");

            }
            catch (Exception ex) //
            {
                var errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return BadRequest($"Error inesperado al crear usuario: {errorMessage}");
            }


        }
        
    }

}
