using System.ComponentModel.DataAnnotations;
using BDfy.Models;

namespace BDfy.Dtos
{
    public class AuctionDtoId
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

        [Required]
        public int[] Category { get; set; } = [];

        [Required]
        public AuctionStatus Status { get; set; }

        [Required(ErrorMessage = "The Direction is mandatory")]
        public Direction Direction { get; set; } = null!;

        [Required]
        public Guid AuctioneerId { get; set; }

        [Required]
        public List<LotGetDto> Lots { get; set; } = [];
    }
}