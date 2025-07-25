using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BDfy.Models
{
    public class UserDetails : Base // Clase para atributos especificos de un Usuario
    {
        [Column("user_id")]
        [ForeignKey("User")]
        [Required]
        public Guid UserId { get; set; }

        [Column("is_admin")]
        [Required]
        public bool IsAdmin { get; set; }

        [Required(ErrorMessage = "The verification status is mandatory")]
        [Column("is_verified")]
        public bool IsVerified{ get; set; }

        [InverseProperty("Winner")]
        public List<Lot> Lots { get; set; } = [];

        [ForeignKey("UserId")]
        [JsonIgnore]
        public User User { get; set; } = null!;

        [InverseProperty("Buyer")]
        public List<AutoBidConfig> AutoBidConfigs { get; set; } = [];

        [InverseProperty("Buyer")]
        public List<Bid> Bids { get; set; } = [];

        public UserDetails() { } // EF
    }
}