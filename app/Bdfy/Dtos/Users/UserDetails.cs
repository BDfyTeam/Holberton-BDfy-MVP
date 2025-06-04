using System.ComponentModel.DataAnnotations;

namespace BDfy.Dtos
{

	public class UserDetailsDto
	{
		[Required]
		public bool IsAdmin { get; set; } = false;
		[Required]
		public Guid UserId { get; set; }
	}
}