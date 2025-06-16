using BDfy.Controllers;
using BDfy.Models;
using BDfy.Data;
using BDfy.Dtos;
using System.Net;
using FluentAssertions;
using RestSharp;
using Bdfy.Requests;


namespace Bdfy.Tests
{
    public class UserApiTest
    {

        [Test]
        public void RegisterBuyer()
        {
            POSTRequestBuyer postRequest = new POSTRequestBuyer();
            RestResponse response = POSTRequestBuyer.RegisterNewBuyer();

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.StatusCode.Should().NotBe(HttpStatusCode.BadRequest);
            response.Content.Should().NotBeNull();

        }

        [Test]
        public void RegisterAuctioneer()
        {
            POSTRequestAuctioneer postRequest = new POSTRequestAuctioneer();
            RestResponse response = postRequest.RegisterNewAuctioneer();
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.StatusCode.Should().NotBe(HttpStatusCode.BadRequest);
            response.Content.Should().NotBeNull();
        }
    }

}