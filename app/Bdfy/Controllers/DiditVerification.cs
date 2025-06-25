using BDfy.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestSharp;
using BDfy.Configurations;
using Microsoft.EntityFrameworkCore;

namespace BDfy.Controllers
{
    [ApiController]
    [Route("api/1.0/verification")]
    public class DiditVerificationsController(BDfyDbContext db, AppSettings ApiKey, ILogger<DiditVerificationsController> logger) : BaseController(db)
    {
        protected readonly AppSettings _Apikey = ApiKey;
        private readonly ILogger<DiditVerificationsController> _logger = logger;

        [Authorize]
        [HttpPost("{userId}")]
        public async Task<ActionResult> CreateSession([FromRoute] Guid userId)
        {
            var userClaims = HttpContext.User;
            var userIdFromToken = userClaims.FindFirst("Id")?.Value;
            var userRoleFromToken = userClaims.FindFirst("Role")?.Value;

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) { return BadRequest("User not found"); }

            if (string.IsNullOrEmpty(userIdFromToken) || !Guid.TryParse(userIdFromToken, out var ParseduserId)) { return Unauthorized("Invalid user token"); }

            if (user.Id != ParseduserId)
            {
                return Unauthorized("Access Denied: Different User id from token");
            }

            var options = new RestClientOptions("https://verification.didit.me/v2/session/");
            var client = new RestClient(options);
            var request = new RestRequest("");
            request.AddHeader("accept", "application/json");
            request.AddHeader("x-api-key", _Apikey.APIKeyDidit);
            request.AddJsonBody(new { workflow_id = _Apikey.WorkflowId });
            var response = await client.PostAsync(request);

            if (response == null || response.Content == null)
            {
                _logger.LogError("Error a la hora de crear una sesion");
                return BadRequest("The response was not found");
            }

            var json = System.Text.Json.JsonDocument.Parse(response.Content);

            if (json.RootElement.TryGetProperty("url", out var url))
            {
                if (json.RootElement.TryGetProperty("session_id", out var sessionId))
                {
                    return Ok(new
                    {
                        URL = url.GetString()!,
                        SessionId = sessionId.GetString()!
                    });
                }
            }
            else
            {
                _logger.LogError("No se encontró la propiedad 'url' en la respuesta.");
                return BadRequest("The URL in the response doesn't exist");
            }
            return BadRequest();
        }

        [Authorize]
        [HttpGet("{userId}/{sessionId}")]
        public async Task<ActionResult> RetrieveSession([FromRoute] Guid userId, [FromRoute] string sessionId)
        {
            var userClaims = HttpContext.User;
            var userIdFromToken = userClaims.FindFirst("Id")?.Value;
            var userRoleFromToken = userClaims.FindFirst("Role")?.Value;

            var user = await _db.Users
                .Include(u => u.UserDetails)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null || user.UserDetails == null) { return BadRequest("User not found"); }

            if (string.IsNullOrEmpty(userIdFromToken) || !Guid.TryParse(userIdFromToken, out var ParseduserId)) { return Unauthorized("Invalid user token"); }

            if (user.Id != ParseduserId)
            {
                return Unauthorized("Access Denied: Different User id from token");
            }

            var options = new RestClientOptions($"https://verification.didit.me/v2/session/{sessionId}/decision/");
            var client = new RestClient(options);
            var request = new RestRequest("");
            request.AddHeader("accept", "application/json");
            request.AddHeader("x-api-key", _Apikey.APIKeyDidit);
            var response = await client.GetAsync(request);

            if (response == null || response.Content == null)
            {
                _logger.LogError("Error a la hora de crear una sesion");
                return BadRequest("The response was not found");
            }

            var json = System.Text.Json.JsonDocument.Parse(response.Content);
            if (json.RootElement.TryGetProperty("status", out var Status))
            {
                if (Status.GetString() == "Approved")
                {
                    user.UserDetails.IsVerified = true;
                }
                else { user.UserDetails.IsVerified = false; }
                await _db.SaveChangesAsync();

                return Ok(new
                {
                    Status = Status.GetString()!,
                });
            }
            else
            {
                _logger.LogError("No se encontró la propiedad 'status' en la respuesta.");
                return BadRequest(new { error = "Property 'status' not found", keys = json.RootElement.EnumerateObject().Select(p => p.Name) });
            }
        }

    }
}