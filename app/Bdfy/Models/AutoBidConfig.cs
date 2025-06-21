using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDfy.Models
{
    public class AutoBidConfig : Base
    {
        [Required]
        [Column("increase_price")]
        public decimal IncreasePrice { get; set; }

        [Required]
        [Column("max_bid")]
        public decimal MaxBid { get; set; }

        [Required]
        [Column("is_active")]
        public bool IsActive { get; set; }

        [Required]
        public UserDetails Buyer { get; set; } = null!;

        [Required]
        [Column("buyer_id")]
        public Guid BuyerId { get; set; }

        [Required]
        public Lot Lot { get; set; } = null!;

        [Required]
        [Column("lot_id")]
        public Guid LotId { get; set; }

    }
}