using System.Text.Json.Serialization;

namespace BDfy.Dtos
{
    public class OpenRouterRequest
    {
        [JsonPropertyName("model")]
        public string Model { get; set; } = "anthropic/claude-3-sonnet";

        [JsonPropertyName("messages")]
        public List<OpenRouterMessage> Messages { get; set; } = new();

        [JsonPropertyName("functions")]
        public List<FunctionDefinition>? Functions { get; set; }

        [JsonPropertyName("function_call")]
        public string? FunctionCall { get; set; }
    }

    public class OpenRouterMessage
    {
        [JsonPropertyName("role")]
        public string Role { get; set; } = string.Empty;
        
        [JsonPropertyName("content")]
        public string Content { get; set; } = string.Empty;
    }

    public class OpenRouterResponse
    {
        [JsonPropertyName("choices")]
        public List<OpenRouterChoice> Choices { get; set; } = new();
    }

    public class OpenRouterChoice
    {
        [JsonPropertyName("message")]
        public OpenRouterMessage Message { get; set; } = new();
        
        [JsonPropertyName("function_call")]
        public FunctionCall? FunctionCall { get; set; }
    }
}