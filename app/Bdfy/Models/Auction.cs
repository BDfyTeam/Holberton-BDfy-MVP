using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDfy.Models
{
    public enum AuctionStatus
    {
        Closed, Active, Draft
    }
    public class Auction : Base // Clase Subasta
    {
        [Required(ErrorMessage = "The Title is mandatory")]
        [StringLength(100, ErrorMessage = "The Title cannot have more than 100 characters")]
        [Column("title")]
        public string Title { get; set; } = null!;

        [Required]
        [StringLength(1200, ErrorMessage = "The Description cannot have more than 1200 characters")]
        [Column("description")]
        public string Description { get; set; } = null!;

        [Required]
        [Column("start_at")]
        public DateTime StartAt { get; set; }

        [Required]
        [Column("end_at")]
        public DateTime EndAt { get; set; }

        [Column("category")]
        public List<int>? Category { get; set; } = [];

        [Required]
        [Column("status")]
        public AuctionStatus Status { get; set; }

        [Required(ErrorMessage = "The Direction is mandatory")]
        [Column("direction")]
        public Direction Direction { get; set; } = null!;

        [Required]
        [Column("auctioneer_id")]
        public Guid AuctioneerId { get; set; }

        [Required]
        [Column("auctioneer")]
        public AuctioneerDetails Auctioneer { get; set; } = null!;

        [Required]
        [Column("lots")]
        public List<Lot> Lots { get; set; } = [];

        public Auction() { } // EF

    }
}