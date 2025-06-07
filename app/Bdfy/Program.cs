using BDfy.Data;
using BDfy.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using BDfy.Configurations;

var builder = WebApplication.CreateBuilder(args);

// 🔐 Configuración de AppSettings (para acceder a SecretKey desde IOptions)
builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppSettings"));

// 💾 DbContext
builder.Services.AddDbContext<BDfyDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// 🛠️ Servicios personalizados
builder.Services.AddScoped<Storage>();

// 🧱 Controllers
builder.Services.AddControllers();

// 🌐 CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 📈 Swagger + Bearer token
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

// 🔑 JWT Authentication
builder.Services.AddAuthentication().AddJwtBearer(options =>
{
    var secret = builder.Configuration["AppSettings:SecretKey"]
        ?? "iMpoSIblePASSword!!!8932!!!!!!!!!!!!!!!!!!!!!!!!!!!!"; // fallback para desarrollo

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))
    };
});

// 🚦 Rate Limiting con manejo personalizado cuando se supera el límite
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("register_policy", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,                      // ❗ 5 intentos por IP
                Window = TimeSpan.FromMinutes(1),     // ❗ por cada 1 minuto
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 2
            }));

    // 👇 Respuesta personalizada cuando se supera el límite
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsync(
            "{\"error\": \"Too many requests. Please try again later.\"}", token);
    };
});

var app = builder.Build();

// 🧪 Swagger sólo en desarrollo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Bdfy API v1");
    });
}

// 🧱 Middleware
app.UseCors("AllowAll");

app.UseRateLimiter();       // 👈 Activar Rate Limiter
app.UseAuthentication();    // 👈 JWT auth
app.UseAuthorization();     // 👈 Roles y claims

app.MapControllers();
app.Run();
