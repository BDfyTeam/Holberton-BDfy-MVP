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

            modelBuilder.Entity<User>().ToTable("users");
            modelBuilder.Entity<UserDetails>().ToTable("userdetails");
            modelBuilder.Entity<AuctioneerDetails>().ToTable("auctioneerdetails");
            modelBuilder.Entity<Auction>().ToTable("auctions");
            modelBuilder.Entity<Lot>().ToTable("lots");
            modelBuilder.Entity<Bid>().ToTable("bids");

            //  UserDetails <-> User (1:1)
            modelBuilder.Entity<User>()
                .HasOne(u => u.UserDetails)
                .WithOne(ud => ud.User)
                .HasForeignKey<UserDetails>(ud => ud.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // AuctioneerDetails <-> User (1:1)
            modelBuilder.Entity<User>()
                .HasOne(u => u.AuctioneerDetails)
                .WithOne(ad => ad.User)
                .HasForeignKey<AuctioneerDetails>(ad => ad.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .OwnsOne(u => u.Direction, dir =>
                {
                    dir.Property(d => d.Street)
                        .HasColumnName("direction_street");
                    dir.Property(d => d.StreetNumber)
                        .HasColumnName("direction_street_number");
                    dir.Property(d => d.Corner)
                        .HasColumnName("direction_corner");
                    dir.Property(d => d.ZipCode)
                        .HasColumnName("direction_zip_code");
                    dir.Property(d => d.Department)
                        .HasColumnName("direction_department");
                });

            modelBuilder.Entity<Auction>()
            .OwnsOne(a => a.Direction, dir =>
            {
                dir.Property(d => d.Street)
                    .HasColumnName("direction_street");
                dir.Property(d => d.StreetNumber)
                    .HasColumnName("direction_street_number");
                dir.Property(d => d.Corner)
                    .HasColumnName("direction_corner");
                dir.Property(d => d.ZipCode)
                    .HasColumnName("direction_zip_code");
                dir.Property(d => d.Department)
                    .HasColumnName("direction_department");
            });
                
            // Auction --> AuctioneerDetails
            modelBuilder.Entity<Auction>(entity =>
            {
                entity.HasOne(a => a.Auctioneer) // Auctioneer es AuctioneerDetails
                      .WithMany(ad => ad.Auctions)
                      .HasForeignKey(a => a.AuctioneerId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Auction --> Lot
                entity.HasMany(a => a.Lots)
                      .WithOne(l => l.Auction)
                      .HasForeignKey(l => l.AuctionId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            //  Lot --> Winner (User)
            modelBuilder.Entity<Lot>(entity =>
            {
            entity.HasOne(l => l.Winner)
                .WithMany(ud => ud.Lots)
                .HasForeignKey(l => l.WinnerId)
                .OnDelete(DeleteBehavior.SetNull);

                // Lot --> Bid
                entity.HasMany(l => l.BiddingHistory)
                      .WithOne(b => b.Lot)
                      .HasForeignKey(b => b.LotId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Bid --> User (Buyer)
            modelBuilder.Entity<Bid>(entity =>
            {
                entity.HasOne(b => b.Buyer) // User
                      .WithMany()
                      .HasForeignKey(b => b.BuyerId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}