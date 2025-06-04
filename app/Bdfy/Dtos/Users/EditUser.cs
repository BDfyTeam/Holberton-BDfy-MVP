using BDfy.Models;

namespace BDfy.Dtos
{

	public record EditUserDto
	(
		string FirstName,
		string LastName,
		string Email,
		string Password,
		string Ci,
		string Phone,
		UserRole Role,
		Direction Direction,
		object? Details
	);
}