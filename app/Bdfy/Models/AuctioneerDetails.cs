using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BDfy.Models
{
    public class AuctioneerDetails : Base // Clase para atributos especificos de un Auctioneer
    {
        [Column("user_id")]
        [ForeignKey("User")]
        [Required]
        public Guid UserId { get; set; }

        [Column("plate")] 
        [Required]
        public int Plate { get; set; }

        [ForeignKey("UserId")]
        [JsonIgnore]
        public User User { get; set; } = null!;
        
        [InverseProperty("Auctioneer")]
        public List<Auction> Auctions { get; set; } = null!;
    }
}