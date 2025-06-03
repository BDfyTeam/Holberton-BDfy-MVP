using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDfy.Models
{
    public class Bid : Base // Clase Bid, para poder pujar en los lotes
    {
        [Required]
        [Column("amount")]
        public decimal Amount { get; set; }
        
        [Required]
        [Column("time")]
        public DateTime Time { get; set; }

        [Required]
        [Column("lot_id")]
        public int LotId { get; set; }
        public Lot Lot { get; set; } = null!;

        [Required]
        [Column("buyer_id")]
        public int BuyerId { get; set; }
        public UserDetails Buyer { get; set; } = null!;

        public Bid() {  } // EF
    }
}