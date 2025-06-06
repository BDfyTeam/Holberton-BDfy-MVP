using System.ComponentModel.DataAnnotations;
using BDfy.Models;

namespace BDfy.Dtos
{
    public class RegisterAuctionDto
    {
        [Required(ErrorMessage = "The Title is mandatory")]
        [StringLength(100, ErrorMessage = "The Title cannot have more than 100 characters")]
        public string Title { get; set; } = null!;

        [Required]
        [StringLength(1200, ErrorMessage = "The Description cannot have more than 1200 characters")]
        public string Description { get; set; } = null!;

        [Required]
        public DateTime StartAt { get; set; }

        [Required]
        public DateTime EndAt { get; set; }

        public int[]? Category { get; set; } = [];

        [Required]
        public AuctionStatus Status { get; set; }

        [Required(ErrorMessage = "The Direction is mandatory")]
        public Direction Direction { get; set; } = null!;

        public object? Details { get; set; }
    }

    public class AuctioneerDto
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public int Plate { get; set; }
    }

    public class AuctionDto
    {
        [Required(ErrorMessage = "The Id is mandatory")]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "The Title is mandatory")]
        [StringLength(100, ErrorMessage = "The Title cannot have more than 100 characters")]
        public string Title { get; set; } = null!;

        [Required]
        [StringLength(1200, ErrorMessage = "The Description cannot have more than 1200 characters")]
        public string Description { get; set; } = null!;

        [Required]
        public DateTime StartAt { get; set; }

        [Required]
        public DateTime EndAt { get; set; }

        public int[]? Category { get; set; } = [];

        [Required]
        public AuctionStatus Status { get; set; }

        [Required(ErrorMessage = "The Direction is mandatory")]
        public Direction Direction { get; set; } = null!;

        [Required]
        public Guid AuctioneerId { get; set; }

        [Required]
        public AuctioneerDto Auctioneer { get; set; } = null!;
        
        [Required]
        public List<Lot> Lots { get; set; } = [];

    }
}