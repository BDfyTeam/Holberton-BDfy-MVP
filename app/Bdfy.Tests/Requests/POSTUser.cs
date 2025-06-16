using RestSharp;
using BDfy.Dtos;
using BDfy.Models;
using Microsoft.AspNetCore.Components.Web;


namespace Bdfy.Requests
{

    public class POSTRequestBuyer
    {
        public static RestResponse RegisterNewBuyer()
        {
            var baseUrl = "http://localhost:5015/api/1.0/users/register";
            RestClient client = new RestClient(baseUrl);
            var body = BuildBodyRequest();
            RestRequest restRequest = new RestRequest(baseUrl, Method.Post);
            restRequest.AddBody(body, ContentType.Json);

            RestResponse restResponse = client.Execute(restRequest);

            return restResponse;
        }
        public static RegisterDto BuildBodyRequest()
        {
            return new RegisterDto
            {
                FirstName = "Lucas",
                LastName = "Goncalves",
                Email = "ellucasdel@gmail.com",
                Password = "Lucas1234",
                Ci = "4.100.500-3",
                Reputation = 65,
                Phone = "094667889",
                Role = 0,
                Direction = new Direction
                {
                    Street = "Yamandu Orsi",
                    StreetNumber = 104,
                    Corner = "Ni idea",
                    ZipCode = 15600,
                    Department = "Artigas"
                },
                UserDetails = new UserDetailsDto { IsAdmin = true }
            };
        }
        }
    }
    public class POSTRequestAuctioneer
    {
        public RestResponse RegisterNewAuctioneer()
        {
            var baseUrl = "http://localhost:5015/api/1.0/users/register";
            RestClient client = new RestClient(baseUrl);
            var body = BuildBodyRequest();
            RestRequest restRequest = new RestRequest(baseUrl, Method.Post);
            restRequest.AddBody(body, ContentType.Json);

            RestResponse restResponse = client.Execute(restRequest);

            return restResponse;
        }
        public static RegisterDto BuildBodyRequest()
        {
            return new RegisterDto
            {
                FirstName = "Rodrigo",
                LastName = "Ferrer",
                Email = "rodrigoferrer640@gmail.com",
                Password = "Rodrigo1234",
                Ci = "3.645.709-3",
                Reputation = 100,
                Phone = "096254856",
                Role = UserRole.Auctioneer,
                Direction = new Direction
                {
                    Street = "Viña del Mar",
                    StreetNumber = 106,
                    Corner = "Cannes",
                    ZipCode = 15100,
                    Department = "Canelones"
                },
                AuctioneerDetails = new AuctioneerDetailsDto { Plate = 6656 }
            };
        }
    }
    public class POSTRequestAuction
    {
        public static RestResponse RegisterNewAuction()
        {
            var baseUrl = "http://localhost:5015/api/1.0/auctions/";
            RestClient client = new RestClient(baseUrl);
            var body = BuildBodyRequest();
            RestRequest restRequest = new RestRequest(baseUrl, Method.Post);
            restRequest.AddBody(body, ContentType.Json);

            RestResponse restResponse = client.Execute(restRequest);

            return restResponse;
        }

        public static RegisterAuctionDto BuildBodyRequest()
        {
            return new RegisterAuctionDto
            {
                Title = "Subasta de arte moderna",
                Description = "Una colección única de arte contemporáneo en subasta.",
                StartAt = DateTime.UtcNow.AddMinutes(25),
                EndAt = DateTime.UtcNow.AddMinutes(120),
                Category = [0],
                Status = AuctionStatus.Active,
                Direction = new Direction
                {
                    Street = "Avenida Libertador",
                    StreetNumber = 1234,
                    Corner = "Avenida 9 de Julio",
                    ZipCode = 1010,
                    Department = "Buenos Aires"
                }
            };
    }

}


        
