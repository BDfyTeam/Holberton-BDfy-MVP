using System.ComponentModel.DataAnnotations;
using BDfy.Models;

namespace BDfy.Dtos
{
    public class GetLotByIdDto
    {
        [Required]
        public Guid Id { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "The title cannot have more than 100 characters")]
        public string Title { get; set; } = null!;

        [Required]
        public string ImageUrl { get; set; } = null!;

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Lot number must be greater than 0")]
        public int LotNumber { get; set; }

        [Required]
        [StringLength(200, ErrorMessage = "The Description cannot have more than 50 characters")]
        public string Description { get; set; } = null!;

        [Required]
        [StringLength(80, ErrorMessage = "The Details cannot have more than 80 characters")]
        public string Details { get; set; } = null!;

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Starting price cannot be negative")]
        public decimal StartingPrice { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Current price must be greater than 0")]
        public decimal? CurrentPrice { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Ending price must be greater than 0")]
        public decimal? EndingPrice { get; set; }

        [Required]
        public bool Sold { get; set; }
        
        public Guid? WinnerId { get; set; }

        [Required]
        public LotByIdAuctionDto Auction { get; set; } = null!; // Auction, auctioneer

    }

    public class LotGetDto
    {
        [Required]
        public Guid Id { get; set; }
        
        [Required]
        [StringLength(100, ErrorMessage = "The title cannot have more than 100 characters")]
        public string Title { get; set; } = null!;

        [Required]
        public string ImageUrl { get; set; } = null!;

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Lot number must be greater than 0")]
        public int LotNumber { get; set; }

        [Required]
        [StringLength(200, ErrorMessage = "The Description cannot have more than 50 characters")]
        public string Description { get; set; } = null!;

        [Required]
        [StringLength(80, ErrorMessage = "The Details cannot have more than 80 characters")]
        public string Details { get; set; } = null!;

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Starting price cannot be negative")]
        public decimal StartingPrice { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Current price must be greater than 0")]
        public decimal? CurrentPrice { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Ending price must be greater than 0")]
        public decimal? EndingPrice { get; set; }

        [Required]
        public bool Sold { get; set; }

        [Required]
        public Guid AuctionId { get; set; }
        
        public Guid? WinnerId { get; set; }
    }
}

    