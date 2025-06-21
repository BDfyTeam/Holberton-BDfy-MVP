using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using BDfy.Models;
using System.Text;
using BDfy.Configurations;
using Microsoft.Extensions.Options;

namespace BDfy.Services
{
    public class GenerateJwtToken
    {
        private readonly string _secretKey;

        public GenerateJwtToken(IOptions<AppSettings> appSettings)
        {
            _secretKey = appSettings.Value.SecretKey;
        }

         public string GenerateJwt(User user)
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
    }
}