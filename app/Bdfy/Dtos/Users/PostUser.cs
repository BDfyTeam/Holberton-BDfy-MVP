

namespace BDfy.Dtos
{

	public record RegisterDto
	(
		string FirstName,
		string LastName,
		string Email,
		string Password,
		int Ci,
		int Phone,
		UserRole Role,
		Direction Direction,
		object? Details
	);
}