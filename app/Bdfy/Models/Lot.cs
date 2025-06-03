using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDfy.Models
{
    public class Lot : Base // Clase lote
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Lot number must be greater than 0")]
        [Column("lot_number")]
        public int LotNumber { get; set; }

        [Required]
        [StringLength(200, ErrorMessage = "The Description cannot have more than 50 characters")]
        [Column("description")]
        public string Descritpion { get; set; } = null!;

        [Required]
        [StringLength(80, ErrorMessage = "The Details cannot have more than 80 characters")]
        [Column("details")]
        public string Details { get; set; } = null!;

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Starting price cannot be negative")]
        [Column("starting_price")]
        public decimal StartingPrice { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Current price must be greater than 0")]
        [Column("current_price")]
        public decimal? CurrentPrice { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Ending price must be greater than 0")]
        [Column("ending_price")]
        public decimal? EndigPrice { get; set; }

        [Required]
        [Column("auction_id")]
        public int AuctionId { get; set; }
        public Auction Auction { get; set; } = null!;

        [Column("winner_id")]
        public int? WinnerId { get; set; }
        public UserDetails? Winner { get; set; }

        public List<Bid> BiddingHistory { get; set; } = null!;

        public Lot() { } // EF
    }
}