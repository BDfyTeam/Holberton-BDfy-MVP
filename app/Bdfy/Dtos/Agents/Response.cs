namespace BDfy.Dtos
{
    public class AgentResponse
    {
        public string Content { get; set; } = string.Empty;
        public bool Success { get; set; }
        public List<FunctionCall>? FunctionCalls { get; set; }
        public object? Data { get; set; }
    }
}