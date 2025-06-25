using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDfy.Models
{
    public class AuctionLot // Clase intermedia de lotes y subastas
    {

        [Required]
        [Column("auction_id")]
        public Guid AuctionId { get; set; }
        public Auction Auction { get; set; } = null!;

        [Required]
        [Column("lot_id")]
        public Guid LotId { get; set; }
        public Lot Lot { get; set; } = null!;

        [Required]
        [Column("is_original_auction")]
        public bool IsOriginalAuction { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
        
        public AuctionLot()
        {
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}