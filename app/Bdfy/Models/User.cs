using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BDfy.Models
{

    public enum UserRole
    {
        Buyer, Auctioneer
    }
    public class User : Base // Clase de usuario base, lo comparte tanto Buyer como Auctioneer
    {
        [Required(ErrorMessage = "The first name is mandatory")]
        [StringLength(50, ErrorMessage = "The First Name cannot have more than 50 characters")]
        [RegularExpression(@"^[\p{L}]+$", ErrorMessage = "The First Name can only contain letters")]
        [Column("first_name")]
        public string FirstName { get; set; } = null!;

        [Required(ErrorMessage = "The last name is mandatory")]
        [StringLength(50, ErrorMessage = "The Last Name cannot have more than 50 characters")]
        [RegularExpression(@"^[\p{L}]+$", ErrorMessage = "The Last Name can only contain letters")]
        [Column("last_name")]
        public string LastName { get; set; } = null!;

        [Required(ErrorMessage = "The email is mandatory")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [Column("email")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "The password is mandatory")]
        [StringLength(20, MinimumLength = 8, ErrorMessage = "The password must have at least 8 characters")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$", ErrorMessage = "The password must include at least one uppercase letter, one lowercase letter, and one number")]
        [Column("password")]
        public string Password { get; set; } = null!;

        [Required(ErrorMessage = "The document (C.I) is mandatory")]
        [RegularExpression(@"^[1-9]\d{7,8}$", ErrorMessage = "The document must contain between 7-8 digits")]
        [Column("ci")]
        public string Ci { get; set; } = null!;

        [Required(ErrorMessage = "The reputation is mandatory")]
        [Range(0, 100, ErrorMessage = "Reputation must be between 0 and 100")]
        [Column("reputation")]
        public int Reputation { get; set; }

        [Required(ErrorMessage = "The phone is mandatory")]
        [RegularExpression(@"^09\d{7}$", ErrorMessage = "The phone must be in format 09xxxxxxx")]
        [Column("phone")]
        public string Phone { get; set; } = null!;

        [Required(ErrorMessage = "The role is mandatory")]
        [Column("role")]
        public UserRole Role { get; set; }

        [Column("image_url")]
        [StringLength(100, ErrorMessage = "The image URL cannot have more than 100 characters")]
        public string? ImageUrl { get; set; }

        [Required(ErrorMessage = "The direction is mandatory")]
        public Direction Direction { get; set; } = null!;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [JsonIgnore]
        public UserDetails? UserDetails { get; set; }
        [JsonIgnore]
        public AuctioneerDetails? AuctioneerDetails { get; set; }

        public User() {  } // EF

    }
}