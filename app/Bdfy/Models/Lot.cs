using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace BDfy.Models
{
    public class Lot : Base // Clase lote
    {
        [Required]
        [Column("title")]
        [StringLength(100, ErrorMessage = "The title cannot have more than 100 characters")]
        public string Title { get; set; } = null!;

        [Required]
        [Column("image_url")]
        [StringLength(100, ErrorMessage = "The image URL cannot have more than 100 characters")]
        public string ImageUrl { get; set; } = null!;

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Lot number must be greater than 0")]
        [Column("lot_number")]
        public int LotNumber { get; set; }

        [Required]
        [StringLength(200, ErrorMessage = "The Description cannot have more than 50 characters")]
        [Column("description")]
        public string Description { get; set; } = null!;

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
        public decimal? EndingPrice { get; set; }

        [Required]
        [Column("sold")]
        public bool Sold { get; set; }

        [Column("winner_id")]
        public Guid? WinnerId { get; set; }
        public UserDetails? Winner { get; set; }

        public List<Bid> BiddingHistory { get; set; } = [];
        
        public List<AutoBidConfig> AutoBidHistory { get; set; } = [];

        public List<AuctionLot> AuctionLots { get; set; } = [];

        public Lot() { } // EF
    }
}