using System.ComponentModel.DataAnnotations;
using BDfy.Models;

namespace BDfy.Dtos
{
    public class EditAuctionDto
    {

        public string? Title { get; set; } = null!;

        public IFormFile? Image { get; set; } = null!;

        public string? Description { get; set; } = null!;

        public DateTime? StartAt { get; set; }

        public DateTime? EndAt { get; set; }

        public int[]? Category { get; set; } = [];

        public AuctionStatus? Status { get; set; }

        public DirectionDto? Direction { get; set; } = null!;
    }

    public class DirectionDto
    {
        public string? Street { get; set; }
        public int? StreetNumber { get; set; }
        public string? Corner { get; set; }
        public int? ZipCode { get; set; }
        public string? Department { get; set; }
    }
}