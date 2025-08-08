namespace BDfy.Dtos
{
    public class ChatBotRequest
    {
        public string Message { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string? SessionId { get; set; }
    }

    public class ChatBotResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? AgentUsed { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? Error { get; set; }
    }
}