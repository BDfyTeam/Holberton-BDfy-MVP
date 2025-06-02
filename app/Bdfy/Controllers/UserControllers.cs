using Microsoft.AspNetCore.Mvc;
using BDfy.Dtos;
using System.Data.Common;
using BDfy.Data;
using BDfy.Models;
using System.Text.Json;

namespace BDfy.Controllers
{
    [ApiController]
    [Route("api/1.0/users/[controller]")]
    [ApiExplorerSettings(GroupName = "Users")]

    public class UsersController : ControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult> Register([FromBody] RegisterDto Dto, BDfyDbContext db)
        {   
            using var transaction = await db.Database.BeginTransactionAsync();

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
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
                 var UserObject = ((JsonElement)Dto.Details).Deserialize<UserDetailsDto>();

                     if (UserObject != null)
                     {
                    var details = new UserDetails{
                        UserId =  user.Id,
                        IsAdmin = UserObject.IsAdmin
                    };
                   
                );
                   }
                else if (Dto.Role == UserRole.Auctioneer && Dto.Details != null)
            {
                var AuctioneerObject = ((JsonElement)Dto.Details).Deserialize<AuctioneerDetailsDto>();
            }

            }

                return Ok();
        }
    }

}

// object? Details -----> C#

// dto.Details ----> JSON

// if (dto.Role == UserRole.Buyer){ // Buyer es UserDetails

// 	-Desearilazar el objecto (detailsObject) / JSON a C# Obj
// 	-Verificar que no este null
// 	-Usar el objeto (var details = new UserDetails(UserId = user.Id, IsAdmin = detailsObject.IsAdmin))
// 	-Guardar el details en la base de datos (userdetails // Tabla)
// 	-using var transaction = await db.Database.BeginTransactionAsync();
// }
