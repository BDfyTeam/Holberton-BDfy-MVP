using BDfy.Services;
using BDfy.Models;
using BDfy.Configurations;
using Microsoft.Extensions.Options;
using NUnit.Framework;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;

namespace Bdfy.Tests.Services;

public class GenerateJwtTokenTests
{
    private GenerateJwtToken _generator = null!;

    [SetUp]
    public void Setup()
    {
        var options = Options.Create(new AppSettings { SecretKey = "test_secret" });
        _generator = new GenerateJwtToken(options);
    }

    [Test]
    public void GenerateJwt_IncludesExpectedClaims()
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "user@example.com",
            Role = UserRole.Buyer,
            UserDetails = new UserDetails { UserId = Guid.NewGuid(), IsAdmin = true }
        };

        string token = _generator.GenerateJwt(user);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        Assert.AreEqual(user.Id.ToString(), jwt.Claims.First(c => c.Type == "Id").Value);
        Assert.AreEqual(user.Email, jwt.Claims.First(c => c.Type == "Email").Value);
        Assert.AreEqual(user.Role.ToString(), jwt.Claims.First(c => c.Type == "Role").Value);
        Assert.AreEqual("True", jwt.Claims.First(c => c.Type == "IsAdmin").Value);
    }
}
