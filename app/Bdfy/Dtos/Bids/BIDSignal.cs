using System.ComponentModel.DataAnnotations;

namespace BDfy.Dtos
{
    public class ReceiveBidDto // Clase que actualiza el precio del lote
    {
        [Required]
        public Guid LotId { get; set; }

        [Required]
        public decimal? CurrentPrice { get; set; }

        [Required]
        public Guid BuyerId { get; set; }

        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
    }

    public class SendBidDto // Clase la cual le llega la nueva bid
    {
        [Required]
        public Guid LotId { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public Guid BuyerId { get; set; }
    };
}
