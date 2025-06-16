using BDfy.Controllers;
using BDfy.Models;
using BDfy.Data;
using BDfy.Dtos;
using System.Net;
using FluentAssertions;
using RestSharp;
using Bdfy.Requests;
using Bdfy.Lots;


namespace Bdfy.Tests
{
    public class AuctioneerApiTest
    {

        [Test]
        public void RegisterAuction()
        {
            POSTRequestAuction postRequest = new POSTRequestAuction();
            RestResponse response = POSTRequestAuction.RegisterNewAuction();
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.StatusCode.Should().NotBe(HttpStatusCode.BadRequest);
            response.StatusCode.Should().NotBe(HttpStatusCode.NotFound);
            response.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);
            response.Content.Should().NotBeNull();

        }

        [Test]
        public void RegisterLot()
        {
            POSTRequestLot postRequest = new POSTRequestLot();
            RestResponse response = POSTRequestLot.RegisterNewLot();
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.StatusCode.Should().NotBe(HttpStatusCode.BadRequest);
            response.StatusCode.Should().NotBe(HttpStatusCode.NotFound);
            response.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);
            response.Content.Should().NotBeNull();
    }
    }

}