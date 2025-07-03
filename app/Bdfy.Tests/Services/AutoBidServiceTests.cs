using BDfy.Services;
using BDfy.Data;
using BDfy.Models;
using BDfy.Hub;
using BDfy.Dtos;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using NUnit.Framework;

namespace Bdfy.Tests.Services;

public class AutoBidServiceTests
{
    private ServiceProvider _provider = null!;
    private BDfyDbContext _db = null!;
    private AutoBidService _service = null!;

    [SetUp]
    public void Setup()
    {
        var services = new ServiceCollection();
        services.AddDbContext<BDfyDbContext>(o => o.UseInMemoryDatabase("autobid_test"));
        services.AddLogging();
        _provider = services.BuildServiceProvider();
        _db = _provider.GetRequiredService<BDfyDbContext>();

        var hub = new DummyHubContext();
        var publisher = new DummyBidPublisher();
        var logger = _provider.GetRequiredService<ILogger<AutoBidService>>();
        var scopeFactory = _provider.GetRequiredService<IServiceScopeFactory>();

        _service = new AutoBidService(hub, publisher, logger, scopeFactory);

        var buyer = new User
        {
            Id = Guid.NewGuid(),
            Email = "buyer@test.com",
            Password = "p",
            FirstName = "B",
            LastName = "B",
            Ci = "11111111",
            Reputation = 0,
            Phone = "091000000",
            Role = UserRole.Buyer,
            Direction = new Direction(),
            UserDetails = new UserDetails { IsAdmin = false, IsVerified = true }
        };
        _db.Users.Add(buyer);
        _db.UserDetails.Add(buyer.UserDetails);

        var lot = new Lot
        {
            Id = Guid.NewGuid(),
            LotNumber = 1,
            Description = "desc",
            Details = "details",
            StartingPrice = 10,
            CurrentPrice = 10,
            Sold = false
        };
        _db.Lots.Add(lot);
        _db.AuctionLots.Add(new AuctionLot { AuctionId = Guid.NewGuid(), LotId = lot.Id, Lot = lot, IsOriginalAuction = true });
        _db.SaveChanges();
    }

    [Test]
    public async Task CancelAutoBid_ReturnsFalseWhenNotFound()
    {
        bool result = await _service.CancelAutoBidAsync(Guid.NewGuid(), Guid.NewGuid());
        Assert.IsFalse(result);
    }

    [Test]
    public async Task CancelAutoBid_DeactivatesExistingConfig()
    {
        var buyer = _db.Users.Include(u => u.UserDetails).First();
        var config = new AutoBidConfig
        {
            BuyerId = buyer.UserDetails!.Id,
            Buyer = buyer.UserDetails!,
            LotId = _db.Lots.First().Id,
            Lot = _db.Lots.First(),
            MaxBid = 50,
            IncreasePrice = 5,
            IsActive = true
        };
        _db.AutoBidConfigs.Add(config);
        _db.SaveChanges();

        bool result = await _service.CancelAutoBidAsync(config.Id, buyer.Id);

        Assert.IsTrue(result);
        Assert.IsFalse(_db.AutoBidConfigs.First().IsActive);
    }

    // Dummy classes ----------------------------------------------------
    private class DummyHubContext : IHubContext<BdfyHub, IClient>
    {
        public IHubClients<IClient> Clients { get; } = new DummyClients();
        public IGroupManager Groups { get; } = new DummyGroupManager();
    }

    private class DummyClients : IHubClients<IClient>
    {
        public IClient All => new DummyClient();
        public IClient AllExcept(IReadOnlyList<string> exclude) => new DummyClient();
        public IClient Client(string connectionId) => new DummyClient();
        public IClient Clients(IReadOnlyList<string> connectionIds) => new DummyClient();
        public IClient Group(string groupName) => new DummyClient();
        public IClient GroupExcept(string groupName, IReadOnlyList<string> connectionIds) => new DummyClient();
        public IClient Groups(IReadOnlyList<string> groupNames) => new DummyClient();
        public IClient User(string userId) => new DummyClient();
        public IClient Users(IReadOnlyList<string> userIds) => new DummyClient();
    }

    private class DummyGroupManager : IGroupManager
    {
        public Task AddToGroupAsync(string connectionId, string groupName, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task RemoveFromGroupAsync(string connectionId, string groupName, CancellationToken cancellationToken = default) => Task.CompletedTask;
    }

    private class DummyClient : IClient
    {
        public Task ReceiveMessage(string type, string message) => Task.CompletedTask;
        public Task ReceiveBid(ReceiveBidDto Bid) => Task.CompletedTask;
        public Task ReceiveAutoBidDeactivated(object deactivationData) => Task.CompletedTask;
        public Task ReceiveBiddingHistory(List<BiddingHistoryDto> biddingHistory) => Task.CompletedTask;
    }

    private class DummyBidPublisher : BidPublisher
    {
        public DummyBidPublisher() : base(new LoggerFactory().CreateLogger<BidPublisher>(), new ConfigurationBuilder().Build()) {}
        public override Task Publish(SendBidDto bid) => Task.CompletedTask;
    }
}
