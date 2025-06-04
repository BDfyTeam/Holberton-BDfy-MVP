using System.ComponentModel.DataAnnotations;
using BDfy.Models;

namespace BDfy.Dtos
{
	public class LoginUserDto
	{
		[Required(ErrorMessage = "The email is mandatory")]
		[EmailAddress(ErrorMessage = "Invalid email format")]
		public string Email { get; set; } = null!;

		[Required(ErrorMessage = "The password is mandatory")]
		[StringLength(20, MinimumLength = 8, ErrorMessage = "The password must have at least 8 characters")]
		[RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$", ErrorMessage = "The password must include at least one uppercase letter, one lowercase letter, and one number")]
		public string Password { get; set; } = null!;
	}
}