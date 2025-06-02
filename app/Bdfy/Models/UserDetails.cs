using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

        [InverseProperty("Winner")]
        public List<Lot> Lots { get; set; } = [];
        
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        public UserDetails() { } // EF
    }
}