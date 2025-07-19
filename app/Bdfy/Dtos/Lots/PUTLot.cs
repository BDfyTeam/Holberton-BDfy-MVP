using System.ComponentModel.DataAnnotations;
using BDfy.Models;

namespace BDfy.Dtos
{
    public class EditLotDto// Edit Lot DTO
    {
        [StringLength(100, ErrorMessage = "The title cannot have more than 100 characters")]
        public string? Title { get; set; } = null!;

        public IFormFile? Image { get; set; } = null!;
        
        [Range(1, int.MaxValue, ErrorMessage = "Lot number must be greater than 0")]
        public int? LotNumber { get; set; }

        [StringLength(200, ErrorMessage = "The Description cannot have more than 50 characters")]
        public string? Description { get; set; } = null!;

        [StringLength(80, ErrorMessage = "The Details cannot have more than 80 characters")]
        public string? Details { get; set; } = null!;

        [Range(0, double.MaxValue, ErrorMessage = "Starting price cannot be negative")]
        public decimal? StartingPrice { get; set; }

        [Required]
        public Guid AuctionId { get; set; }

    }   
}