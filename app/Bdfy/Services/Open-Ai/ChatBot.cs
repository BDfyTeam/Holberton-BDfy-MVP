using BDfy.Dtos;
using System.Text;
using System.Text.Json;
using BDfy.Models;
using Google.Apis.Http;
using System.Net.Http.Headers;

namespace BDfy.Services
{
    public interface IChatBot
    {
        Task<ChatBotResponse> ProccessMessageAsync(ChatBotRequest request);
        Task<IntentClassification> ClassifyIntentAsync(string message);
        Task<AgentResponse> ExecuteAgentAsync(string agentType, string message, IntentParameters parameters, string userId);
    }
    public class ChatBot
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<ChatBot> _logger;
        private readonly OrchestratorAgent _orchestratorAgent;

        public ChatBot(HttpClient httpClient, ILogger<ChatBot> logger, OrchestratorAgent orchestratorAgent)
        {
            _httpClient = httpClient;
            _logger = logger;
            _orchestratorAgent = orchestratorAgent;
        }

        async Task<ChatBotResponse> ProccessMessageAsync(ChatBotRequest request)
        {
            try
            {
                _logger.LogInformation("Processing message from user {UserId}: {Message}", request.UserId, request.Message);
                var intent = await ClassifyIntentAsync(request.Message);

                if (intent.Confidence < 0.6)
                {
                    return new ChatBotResponse
                    {
                        Success = true,
                        Message = "No estoy seguro de cómo ayudarte. ¿Podrías ser más específico?",
                        AgentUsed = "orchestrator"
                    };
                }
                var agentResponse = await ExecuteAgentAsync(intent.AgentType, request.Message, intent.Parameters, request.UserId);

                return new ChatBotResponse
                {
                    Success = agentResponse.Success,
                    Message = agentResponse.Content,
                    AgentUsed = intent.AgentType
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing chatbot message for user {UserId}", request.UserId);
                return new ChatBotResponse
                {
                    Success = false,
                    Message = "Lo siento, ocurrió un error procesando tu solicitud.",
                    Error = ex.Message
                };

            }
        }
        public async Task<IntentClassification> ClassifyIntentAsync(string message)
        {
            var httpClient = _httpClient;

            var prompt = $@"
                Analiza el siguiente mensaje de usuario en una web de subastas y clasifica la intención:
                Mensaje: ""{message}""
                
                Responde SOLO con un JSON en este formato:
                {{
                ""agentType"": ""search|bidding|account|support"",
                ""confidence"": 0.9,
                ""parameters"": {{
                    ""category"": ""opcional"",
                    ""auctionId"": ""opcional"",
                    ""query"": ""opcional"",
                    ""amount"": null
                }}
                }}
                
                Criterios:
                - ""search"": buscar productos, ver subastas, filtrar, ver subastadores
                - ""bidding"": pujar, ofertas, historial de pujas, oferta automatica
                - ""account"": perfil, configuración, pagos, historial
                - ""support"": ayuda general, políticas, dudas
                ";
            var request = new OpenRouterRequest
            {
                Model = "openai/gpt-oss-20b:free",
                Messages = [
                    new() { Role = "user", Content = prompt }
                ]
            };
            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            string apiKey = System.Environment.GetEnvironmentVariable("CHAT_BOT_API_KEY") ?? throw new Exception("Api key not setted");

            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var response = await httpClient.PostAsync("https://openrouter.ai/api/v1/chat/completions", content);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();

            var openRouterResponse = JsonSerializer.Deserialize<OpenRouterResponse>(responseContent);
            var messageContent = openRouterResponse?.Choices?.FirstOrDefault()?.Message?.Content;

            if (string.IsNullOrEmpty(messageContent))
            {
                throw new Exception("No response from OpenRouter");
            }

            return JsonSerializer.Deserialize<IntentClassification>(messageContent) ?? new IntentClassification();
        }
        public async Task<AgentResponse> ExecuteAgentAsync(string agentType, string message, IntentParameters parameters, string userId)
        {
            if (!_orchestratorAgent.Agents.TryGetValue(agentType, out var agent))
            {
                _logger.LogWarning("Agent type {AgentType} not found", agentType);
                return new AgentResponse
                {
                    Success = false,
                    Content = "Agente no encontrado"
                };
            }

            return await agent.ExecuteAsync(message, parameters, userId);
        }
        

    }
}