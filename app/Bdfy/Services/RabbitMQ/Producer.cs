using RabbitMQ.Client;
using BDfy.Dtos;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace BDfy.Services
{
    public class BidPublisher // Funcion para publicar la bid a RabbitMQ
    {
        private IChannel? _channel; // Puede ser null pq despues lo manejas
        private IConnection? _connection; // Puede ser null pq despues lo manejas
        private readonly ILogger<BidPublisher> _logger;
        private readonly IConfiguration _configuration;

        public BidPublisher(ILogger<BidPublisher> logger, IConfiguration configuration)
        {
            _logger = logger; // Informacion de la conexion
            _configuration = configuration;
        }
        public async Task InitializeAsync()
        {
        
            var rabbitMQConfig = _configuration.GetSection("RabbitMQ");
            var hostName = rabbitMQConfig["HostName"] ?? throw new InvalidOperationException("RabbitMQ HostName is not configured");
            var userName = rabbitMQConfig["UserName"] ?? throw new InvalidOperationException("RabbitMQ UserName is not configured");
            var password = rabbitMQConfig["Password"] ?? throw new InvalidOperationException("RabbitMQ Password is not configured");
            var virtualHost = rabbitMQConfig["VirtualHost"] ?? "/";

             // LOGGING DETALLADO
            Console.WriteLine($"=== RABBITMQ CONFIGURATION DEBUG ===");
            Console.WriteLine($"HostName from config: '{hostName}'");
            Console.WriteLine($"UserName from config: '{userName}'");
            Console.WriteLine($"VirtualHost from config: '{virtualHost}'");
            Console.WriteLine($"Password length: {password.Length}");
            Console.WriteLine($"======================================");

            var factory = new ConnectionFactory
            {
                HostName = hostName,
                UserName = userName,
                Password = password,
                VirtualHost = virtualHost,
                Ssl = new SslOption
                {
                    Enabled = true,
                    ServerName = hostName
                },
                Port = 5672
            };

            try 
            {
                Console.WriteLine("Attempting to create connection...");
                _connection = await factory.CreateConnectionAsync();
                Console.WriteLine("Connection created successfully!");
                
                _channel = await _connection.CreateChannelAsync();
                Console.WriteLine("Channel created successfully!");
                
                await _channel.QueueDeclareAsync("bids", true, false, false);
                Console.WriteLine("Queue declared successfully!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Connection failed: {ex.Message}");
                Console.WriteLine($"Inner exception: {ex.InnerException?.Message}");
                throw;
            }
        }

        public async Task Publish(SendBidDto bid) // Creamos el producer
        {
            if (_channel == null) // Validacion
            {
                throw new InvalidOperationException("Channel not initialized. Call InitializeAsync first.");// Manejo de errores
            }

            var props = new BasicProperties(); // Propiedades basicas para mandar al canal (solucion para propiedades en null)

            var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(bid)); // Pasamos el mensaje a bytes (Json a bytes)
            await _channel.BasicPublishAsync( // Creamos el producer
                exchange: "", // Default Exchange o Non-Exchange o sea que ira a la cola que tenga la misma key route
                routingKey: "bids", // La Key para la ruta
                mandatory: false, // Seteas que la bid si o si tenga que ir a una cola
                basicProperties: props, // Propiedades en default
                body: body // La puja en bytes
            );
        }
        public void Dispose() // Por si alguno es null la liberamos
        {
            _connection?.Dispose();
            _channel?.Dispose();
        }
    }
}