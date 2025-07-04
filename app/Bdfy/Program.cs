using BDfy.Data;
using BDfy.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using System.Threading.RateLimiting;
using BDfy.Configurations;
using BDfy.Hub;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

// var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
// builder.WebHost.UseUrls($"http://*:{port}");

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Information);

builder.Services.AddSignalR(options =>
{
    // Configuraciones más estables para producción
    options.KeepAliveInterval = TimeSpan.FromSeconds(30);     // Ping cada 30 segundos (no 10)
    options.ClientTimeoutInterval = TimeSpan.FromMinutes(5);  // Timeout: 5 minutos
    options.HandshakeTimeout = TimeSpan.FromSeconds(15);      // 15 segundos para handshake
    options.MaximumReceiveMessageSize = 64 * 1024;           // 64KB límite de mensaje
    options.StreamBufferCapacity = 10;
    options.MaximumParallelInvocationsPerClient = 5;         // Reducido de 10 a 5
    options.EnableDetailedErrors = builder.Environment.IsDevelopment(); // Solo en desarrollo
})
.AddJsonProtocol(options =>
{
    options.PayloadSerializerOptions.PropertyNameCaseInsensitive = true;
    options.PayloadSerializerOptions.PropertyNamingPolicy = null;
    // Mejorar la configuración JSON
    options.PayloadSerializerOptions.WriteIndented = false;
    options.PayloadSerializerOptions.DefaultIgnoreCondition = 
        System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
});

// void AddJsonProtocol(Action<object> value)
// {
//     throw new NotImplementedException();
// }

builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppSettings"));


builder.Services.AddDbContext<BDfyDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder.Services.AddScoped<Storage>();

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("SignalRCorsPolicy", policy =>
    {
        policy
            .WithOrigins(
                "https://localhost:3000", "https://127.0.1:3000", // Frontend
                "http://localhost:5016", "http://127.0.0.1:5016",
                "https://bdfy-frontend-946201117375.southamerica-east1.run.app",
                "https://bdfy.tech", "http://bdfy.tech", "https://bdfy-frontend-us-946201117375.us-central1.run.app") 
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
    });
});

// Swagger + Bearer token
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "1.0",
        Title = "Bdfy API",
        Description = "API para Bdfy"
    });

    c.DocInclusionPredicate((docName, apiDesc) =>
    {
        var actionDescriptor = apiDesc.ActionDescriptor as Microsoft.AspNetCore.Mvc.Controllers.ControllerActionDescriptor;
        if (actionDescriptor == null) return false;
        var groupName = apiDesc.GroupName ?? "v1";
        return docName == groupName;
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

//  JWT Authentication
builder.Services.AddAuthentication().AddJwtBearer(options =>
{
    var secret = builder.Configuration["AppSettings:SecretKey"]
        ?? "iMpoSIblePASSword!!!8932!!!!!!!!!!!!!!!!!!!!!!!!!!!!"; // fallback for developing

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))
    };
});

//  Rate Limiting personalized
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("register_policy", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,                      // 5 trys per ip
                Window = TimeSpan.FromMinutes(1),     //  for each minute
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 2
            }));

    // Json when request limits enters
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsync(
            "{\"error\": \"Too many requests. Please try again later.\"}", token);
    };
});

builder.Services.AddHostedService<AuctionCloserService>(); // Services para determinar cuando una auction termina
builder.Services.AddSingleton<BidPublisher>(); // Servicio de RabbitMQ (Producer)
builder.Services.AddHostedService<BidConsumerService>(); // Host para el servicio de consumer
builder.Services.AddScoped<GenerateJwtToken>(); // Servicio para generar JWT Token
builder.Services.AddScoped<AppSettings>();

builder.Services.AddScoped<AuctionServices>(); // Servicio para editar una subasta // Servicio para editar una subasta
builder.Services.AddScoped<IAutoBidService, AutoBidService>(); // Servicio para hacer Auto-bids
builder.Services.AddScoped<BiddingHistoryService>();
var app = builder.Build();

if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Bdfy API v1");
    });
}
using (var scope = app.Services.CreateScope())
{
    var publisher = scope.ServiceProvider.GetRequiredService<BidPublisher>();
    await publisher.InitializeAsync(); // Inicializamos el productor de RabbitMQ👌
}
app.Use(async (context, next) =>
{
    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
    
    if (context.Request.Path.StartsWithSegments("/BidHub"))
    {
        logger.LogInformation("SignalR Request: {Method} {Path} from {RemoteIp} at {Timestamp}", 
            context.Request.Method, 
            context.Request.Path, 
            context.Connection.RemoteIpAddress,
            DateTime.UtcNow);
            
        // Log headers importantes para debugging
        var connection = context.Request.Headers["Connection"].ToString();
        var upgrade = context.Request.Headers["Upgrade"].ToString();
        var origin = context.Request.Headers["Origin"].ToString();
        
        if (!string.IsNullOrEmpty(connection) || !string.IsNullOrEmpty(upgrade))
        {
            logger.LogInformation("SignalR Headers: Connection={Connection}, Upgrade={Upgrade}, Origin={Origin}",
                connection, upgrade, origin);
        }
    }
    
    await next();
});

// Middleware
app.UseCors("SignalRCorsPolicy");
app.UseRouting();

app.UseRateLimiter();       // Activate the rate limiter
app.UseAuthentication();    // Jwt
app.UseAuthorization();     // Rols & claims
app.MapHub<BdfyHub>("/BidHub");

app.MapControllers();
app.Run();
