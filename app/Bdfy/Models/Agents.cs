using BDfy.Dtos;

namespace BDfy.Models
{
    public interface IAgent // Interfaz para cada agente
    {
        Task<AgentResponse> ExecuteAsync(string userMessage, IntentParameters parameters, string userId);
        List<FunctionDefinition> GetFunctions();
    }
    public class OrchestratorAgent
    {
        public Dictionary<string, IAgent> Agents { get; set; }
                public OrchestratorAgent()
        {
            Agents = new Dictionary<string, IAgent>
            {
                { "search", new SearchAgent() },
                // { "bidding", new BiddingAgent() },
                // { "account", new AccountAgent() },
                // { "support", new SupportAgent() }
            };
        }

    }
public class SearchAgent : IAgent
    {
        public async Task<AgentResponse> ExecuteAsync(string userMessage, IntentParameters parameters, string userId)
        {
            // Implementacion especifica del agente de Busqueda
            return new AgentResponse { Content = "Search agent response", Success = true };
        }

        public List<FunctionDefinition> GetFunctions()
        {
            return
            [ new FunctionDefinition
                {
                    Name = "search_auctions",
                    Description = "Busca subastas activas en la plataforma",
                    Parameters = new FunctionParameters
                    {
                        Type = "object",
                        Properties = new Dictionary<string, object>
                        {
                            { "query", new { type = "string", description = "Termino de busqueda" } },
                            { "category", new { type = "string", description = "Categoria de productos" } },
                            { "max_price", new { type = "number", description = "Precio maximo" } },
                            { "status", new { type = "string", @enum = new[] { "active", "closed", "all" } } }
                        }
                    }
                }
            ];
        }
    }
}