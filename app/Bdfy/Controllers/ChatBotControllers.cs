using BDfy.Data;
using Microsoft.AspNetCore.Mvc;
using BDfy.Services;
using BDfy.Dtos;
using System.Net.Http;
using System.Text.Json;
using System.Text;

namespace BDfy.Controllers
{
    [ApiController]
    [Route("api/1.0/chat-bot")]
    public class ChatBotControllers(BDfyDbContext db) : BaseController(db)
    {

        [HttpPost]
        public async Task<IActionResult> Test([FromBody] string message)
        {
            var body = new
            {
                model = "openai/gpt-oss-20b:free",
                messages = new[]
                {
                    new {
                        role = "user",
                        content = message
                    }
                }
            };

            var json = JsonSerializer.Serialize(body);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            string apiKey = System.Environment.GetEnvironmentVariable("CHAT_BOT_API_KEY") ?? throw new Exception("Api key not setted");

            HttpClient client = new HttpClient();

            HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "https://openrouter.ai/api/v1/chat/completions")
            {
                Content = content,
            };

            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
            HttpResponseMessage response = await client.SendAsync(request);

            string responseBody = await response.Content.ReadAsStringAsync();

            var jsonDoc = JsonDocument.Parse(responseBody);

            string finalMessage = jsonDoc
                .RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString()!;

            return Ok(new
            {
                response = finalMessage
            });
        }
    }
}