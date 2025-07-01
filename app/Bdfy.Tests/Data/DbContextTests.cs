using BDfy.Data;
using BDfy.Models;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;

namespace Bdfy.Tests.Data;

public class DbContextTests
{
    [Test]
    public void CanPersistUserWithDetails()
    {
        var options = new DbContextOptionsBuilder<BDfyDbContext>()
            .UseInMemoryDatabase("db_test")
            .Options;

        using var db = new BDfyDbContext(options);
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "u@a.com",
            Password = "pass",
            FirstName = "F",
            LastName = "L",
            Ci = "11111111",
            Reputation = 0,
            Phone = "099999999",
            Role = UserRole.Buyer,
            Direction = new Direction()
        };
        user.UserDetails = new UserDetails { UserId = user.Id, IsAdmin = false };

        db.Users.Add(user);
        db.SaveChanges();

        Assert.AreEqual(1, db.UserDetails.Count());
        Assert.AreEqual(user.Id, db.UserDetails.Single().UserId);
    }
}
