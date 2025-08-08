namespace BDfy.Dtos
{
    public class FunctionDefinition
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public FunctionParameters Parameters { get; set; } = new();
    }

    public class FunctionParameters
    {
        public string Type { get; set; } = "object";
        public Dictionary<string, object> Properties { get; set; } = new();
        public string[]? Required { get; set; }
    }

    public class FunctionCall
    {
        public string Name { get; set; } = string.Empty;
        public Dictionary<string, object> Arguments { get; set; } = new();
    }
}