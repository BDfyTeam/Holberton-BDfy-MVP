using System.ComponentModel.DataAnnotations;

namespace BDfy.Dtos
{
    public class CreateAutoBidDto
    {
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal IncreasePrice { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal MaxBid { get; set; }
    }
}