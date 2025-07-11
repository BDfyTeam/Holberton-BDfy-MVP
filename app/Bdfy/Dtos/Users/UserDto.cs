using BDfy.Models;

namespace BDfy.Dtos
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Ci { get; set; } = null!;
        public int Reputation { get; set; }
        public string Phone { get; set; } = null!;
        public UserRole Role { get; set; }
        public string? ImageUrl { get; set; }
        public DirectionDto Direction { get; set; } = null!;
        public bool IsActive { get; set; } = true;
        public UserDetailsDto? UserDetails { get; set; }
        public AuctioneerDetailsDto? AuctioneerDetails { get; set; }
    }
}