using BDfy.Services;
using BDfy.Models;
using BDfy.Data;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;

namespace Bdfy.Tests.Services;

public class StorageTests
{
    private BDfyDbContext _db = null!;

    [SetUp]
    public void Setup()
    {
        var options = new DbContextOptionsBuilder<BDfyDbContext>()
            .UseInMemoryDatabase("storage_test")
            .Options;
        _db = new BDfyDbContext(options);

        var auctioneer = new User
        {
            Id = Guid.NewGuid(),
            Email = "a@a.com",
            Password = "pass",
            FirstName = "A",
            LastName = "A",
            Ci = "12345678",
            Reputation = 0,
            Phone = "091111111",
            Role = UserRole.Auctioneer,
            Direction = new Direction()
        };
        _db.Users.Add(auctioneer);
        _db.AuctioneerDetails.Add(new AuctioneerDetails { UserId = auctioneer.Id, Plate = 1 });
        _db.SaveChanges();
    }

    [Test]
    public async Task CreateStorage_CreatesAuctionWithExpectedValues()
    {
        var service = new Storage(_db);
        var auctioneerId = _db.Users.First().Id;

        Auction auction = await service.CreateStorage(auctioneerId);

        Assert.AreEqual("Storage", auction.Title);
        Assert.AreEqual(AuctionStatus.Storage, auction.Status);
        Assert.AreEqual(auctioneerId, auction.AuctioneerId);
    }
}
