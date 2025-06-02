using Microsoft.AspNetCore.Mvc;
using BDfy.Dtos;
using System.Data.Common;

namespace BDfy.Controllers
{
    [ApiController]
    [Route("api/1.0/users/[controller]")]
    [ApiExplorerSettings(GroupName = "Users")]

    public class UsersController : ControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult> Register([FromBody] RegisterDto Dto)
        {   
            using var transaction = await db.Database.BeginTransactionAsync();

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var user = new RegisterDto
            (
                Dto.FirstName,
                Dto.LastName,
                Dto.Email,
                Dto.Password,
                Dto.Ci,
                Dto.Phone,
                Dto.Role,
                Dto.Direction,
                Dto.Details
            );

            // db.users.Add(user);
            // await db.SaveChangeAsync();



            // if (Dto.Role == UserRole.Buyer && Dto.Details != null)
            // {
            //     var UserObject = ((JsonElement)Dto.Details).Deserialize<UserDetailsDto>();

            //         if (UserObject != null)
            //         {
            //             var details = new UserDetails
                   
            //     );
            //        }
            //     else if (Dto.Role == UserRole.Auctioneer && Dto.Details != null)
            // {
            //     var AuctioneerObject = ((JsonElement)Dto.Details).Deserialize<AuctioneerDetailsDto>();
            // }

            // }

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
