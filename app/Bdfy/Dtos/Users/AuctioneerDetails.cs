using System.ComponentModel.DataAnnotations;

namespace BDfy.Dtos
{
	public class AuctioneerDetailsDto
	{
		[Required]
		public int Plate { get; set; }

		[Required]
		public string AuctionHouse { get; set; } = null!;
	}

}