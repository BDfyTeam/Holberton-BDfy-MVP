using System.Text.Json.Serialization;

namespace BDfy.Dtos
{
    public class IntentClassification
    {
        [JsonPropertyName("agentType")]
        public string AgentType { get; set; } = string.Empty;
        
        [JsonPropertyName("confidence")]
        public double Confidence { get; set; }
        
        [JsonPropertyName("parameters")]
        public IntentParameters Parameters { get; set; } = new();
    }
    
    public class IntentParameters
    {
        [JsonPropertyName("category")]
        public string? Category { get; set; }

        [JsonPropertyName("auctionId")]
        public string? AuctionId { get; set; }

        [JsonPropertyName("query")]
        public string? Query { get; set; }

        [JsonPropertyName("amount")]
        public decimal? Amount { get; set; }
    }
}