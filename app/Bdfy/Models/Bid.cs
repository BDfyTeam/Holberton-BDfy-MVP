using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDfy.Models
{
    public class Bid : Base // Clase Bid, para poder pujar en los lotes
    {
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "The amount must be greater than zero")]
        [Column("amount")]
        public decimal Amount { get; set; }
        
        [Required]
        [Column("time")]
        public DateTime Time { get; set; }

        [Required]
        [Column("is_autobid")]
        public bool IsAutoBid { get; set; }

        [Column("parent_auto_bid")]
        public Guid? ParentAutoBid { get; set; }

        [Required]
        [Column("lot_id")]
        public Guid LotId { get; set; }
        public Lot Lot { get; set; } = null!;

        [Required]
        [Column("buyer_id")]
        public Guid BuyerId { get; set; }
        public UserDetails Buyer { get; set; } = null!;

        public Bid() {  } // EF
    }
}