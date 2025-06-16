using System.ComponentModel.DataAnnotations;
using BDfy.Models;


namespace BDfy.Dtos
{
	public class EditAuctioneerDto
	{

		public string? Email { get; set; } = null!;

		public string? Password { get; set; }

		public string? Phone { get; set; } = null!;

		public Direction Direction { get; set; } = null!;
	};
}