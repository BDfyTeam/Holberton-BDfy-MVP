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

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Information);

builder.Services.AddSignalR(options =>
{
    options.KeepAliveInterval = TimeSpan.FromSeconds(30);      // Ping cada 30 segundos
    options.ClientTimeoutInterval = TimeSpan.FromMinutes(1);  // Timeout: 1 minuto
    options.HandshakeTimeout = TimeSpan.FromSeconds(30);       // 30 segundos para handshake
    options.EnableDetailedErrors = true;                       // Errores detallados
});

builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppSettings"));


builder.Services.AddDbContext<BDfyDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder.Services.AddScoped<Storage>();

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .SetIsOriginAllowed(options => true)
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

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Bdfy API v1");
    });
}

// Middleware
app.UseCors("AllowAll");
app.UseRouting();

app.UseRateLimiter();       // Activate the rate limiter
app.UseAuthentication();    // Jwt
app.UseAuthorization();     // Rols & claims
app.MapHub<BdfyHub>("/BidHub");

app.MapControllers();
app.Run();
