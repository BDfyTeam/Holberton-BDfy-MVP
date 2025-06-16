using RestSharp;
using BDfy.Dtos;
using BDfy.Models;
using BDfy.Services;
using Microsoft.AspNetCore.Mvc;
using System;

namespace Bdfy.Lots
{
    public class POSTRequestLot
    {
        private readonly GenerateJwtToken _jwtService;

        public POSTRequestLot(GenerateJwtToken jwtService)
        {
            _jwtService = jwtService;
        }

        public RestResponse RegisterNewLot(User user, Guid auctionId)
        {
            var baseUrl = $"http://localhost:5015/api/1.0/lots/{auctionId}";
            RestClient client = new RestClient(baseUrl);
            var body = BuildBodyRequest();

            RestRequest restRequest = new RestRequest();
            restRequest.AddJsonBody(body);  // Método actualizado para agregar JSON en RestSharp

            // Genera el token JWT para el usuario
            var token = _jwtService.GenerateJwt(user);

            if (string.IsNullOrEmpty(token))
            {
                Console.WriteLine("Token JWT no válido o no generado.");
                throw new Exception("Error");
            }

            restRequest.AddHeader("Authorization", $"Bearer {token}");

            // Ejecuta la solicitud y obtiene la respuesta
            RestResponse restResponse = client.Execute(restRequest);

            // Verifica si la respuesta fue exitosa
            if (restResponse.IsSuccessful)
            {
                Console.WriteLine("Lote registrado correctamente.");
            }
            else
            {
                Console.WriteLine($"Error: {restResponse.StatusCode}, {restResponse.Content}");
            }

            return restResponse;
        }

        // Método para construir el cuerpo de la solicitud (body)
        public static RegisterLot BuildBodyRequest()
        {
            return new RegisterLot
            {
                LotNumber = 1,
                Description = "Lote para reparar",
                Details = "En buen estado",
                StartingPrice = 120
            };
        }
    }
}
