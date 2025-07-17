using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace BDfy.Models
{
    [Owned]
    public class Direction
    {
        [StringLength(100, ErrorMessage = "The Street cannot have more than 100 characters")]
        public string Street { get; set; } = "";

        [Range(1, 99999, ErrorMessage = "Street number must be between 1 and 99999")]
        public int StreetNumber { get; set; }

        [StringLength(100, ErrorMessage = "The Corner cannot have more than 100 characters")]
        public string Corner { get; set; } = "";

        [Range(10000, 99999, ErrorMessage = "ZipCode must be a valid 5-digit number")]
        public int ZipCode { get; set; }

        [StringLength(20, ErrorMessage = "The Department cannot have more than 20 characters")]
        public string Department { get; set; } = "";
    }
}