using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDfy.Models
{
    public class Lot : Base // Clase lote
    {
        [Column]
        public int LotNumber { get; set; }

        [Column]
        public string Descritpion { get; set; } = null!;

        [Column]
        public decimal StartingPrice { get; set; }

        [Column]
        public decimal? CurrentPrice { get; set; }

        [Column]
        public decimal? EndigPrice { get; set; }

        [Column]
        public int AuctionId { get; set; }
        public Auction Auction { get; set; } = null!;

        [Column]
        public int? WinnerId { get; set; }
        public UserDetails? Winner { get; set; }

        public List<Bid> BiddingHistory { get; set; } = null!;

        public Lot() { } // EF
    }
}