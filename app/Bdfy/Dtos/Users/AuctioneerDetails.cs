using System.ComponentModel.DataAnnotations;
using BDfy.Models;

namespace BDfy.Dtos
{
	public class AuctioneerDetailsDto
	{
		[Required]
		public int Plate { get; set; }
	}

}