using Microsoft.EntityFrameworkCore;
using BDfy.Models;

namespace BDfy.Data
{
    public class BDfyDbContext : DbContext
    {
        public BDfyDbContext(DbContextOptions<BDfyDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<UserDetails> UserDetails { get; set; }
        public DbSet<AuctioneerDetails> AuctioneerDetails { get; set; }
        public DbSet<Auction> Auctions { get; set; }
        public DbSet<Lot> Lots { get; set; }
        public DbSet<Bid> Bids { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
    }
}