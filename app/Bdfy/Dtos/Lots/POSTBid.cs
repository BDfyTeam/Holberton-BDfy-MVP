using System.ComponentModel.DataAnnotations;

namespace BDfy.Dtos
{
    public class BidDto
    {
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "The amount must be greater than zero")]
        public decimal Amount { get; set; }
        
        [Required]
        public DateTime Time { get; set; }

        [Required]
        public Guid LotId { get; set; }
    }
}