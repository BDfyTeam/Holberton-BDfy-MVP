using BDfy.Dtos;

namespace BDfy.Services
{
    public interface IAgentsFunctions
    {
        Task<AuctionDtoId> SearchAuctionAsync(string query, string? category, decimal? maxPrice, string? status, string userId);
    }
    public class AgentsFunctions //: IAgentsFunctions
    {
        private readonly HttpClient _httpClient;

        public AgentsFunctions(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        // public async Task<AuctionDtoId> SearchAuctionAsync(string query, string? category, decimal? maxPrice, string? status, string userId)
        // {
            
        // }
    }
}