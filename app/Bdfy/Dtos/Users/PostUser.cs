using System.ComponentModel.DataAnnotations;
using BDfy.Models;
using BDfy.Validations;

namespace BDfy.Dtos
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "The first name is mandatory")]
        [StringLength(50, ErrorMessage = "The First Name cannot have more than 50 characters")]
        [RegularExpression("^[a-zA-Z]+$", ErrorMessage = "The First Name can only contain letters")]
        public string FirstName { get; set; } = null!;

        [Required(ErrorMessage = "The last name is mandatory")]
        [StringLength(50, ErrorMessage = "The Last Name cannot have more than 50 characters")]
        [RegularExpression("^[a-zA-Z]+$", ErrorMessage = "The Last Name can only contain letters")]
        public string LastName { get; set; } = null!;

        private string _email = null!;
        [Required(ErrorMessage = "The email is mandatory")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [ValidEmailDomain(ErrorMessage = "The email domain is not valid or does not exist.")]
        public string Email
        {
            get => _email;
            set => _email = value.ToLower();
        }

        [Required(ErrorMessage = "The password is mandatory")]
        [StringLength(20, MinimumLength = 8, ErrorMessage = "The password must have at least 8 characters")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$", ErrorMessage = "The password must include at least one uppercase letter, one lowercase letter, and one number")]
        public string Password { get; set; } = null!;

        private string _ci = null!;
        [Required(ErrorMessage = "The document (C.I) is mandatory")]
        [RegularExpression(@"^[1-9]\d{7,8}$", ErrorMessage = "The document must contain between 8-9 digits")]
        public string Ci
        {
            get => _ci;
            set => _ci = new string(value.Where(char.IsDigit).ToArray());
        }

        [Required(ErrorMessage = "The reputation is mandatory")]
        [Range(0, 100, ErrorMessage = "Reputation must be between 0 and 100")]
        public int Reputation { get; set; }

        [Required(ErrorMessage = "The phone is mandatory")]
        [RegularExpression(@"^09\d{7}$", ErrorMessage = "The phone must be in format 09xxxxxxx")]
        public string Phone { get; set; } = null!;

        [Required(ErrorMessage = "The role is mandatory")]
        public UserRole Role { get; set; }

        [Required(ErrorMessage = "The direction is mandatory")]
        public Direction Direction { get; set; } = null!;

        public object? Details { get; set; }
    }
}
