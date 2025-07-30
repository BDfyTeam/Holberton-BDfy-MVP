using Jose;
using Livekit.Server.Sdk.Dotnet;

namespace BDfy.Services
{
    public interface LiveKitService
    {
        string GenerateLiveKitToken(string apiKey, string apiSecret, Guid auctioneerId, string auctioneerFirstName, string auctionTitle);
    }
    public class LiveKit : LiveKitService
    {
        public string GenerateLiveKitToken(string apiKey, string apiSecret, Guid auctioneerId, string auctioneerFirstName, string auctionTitle)
        {
            var token = new AccessToken(apiKey, apiSecret)
                .WithIdentity(auctioneerId.ToString())
                .WithName(auctioneerFirstName)
                .WithGrants(new VideoGrants { RoomJoin = true, CanPublish = true, CanPublishSources = ["camera", "microphone"], CanSubscribe = true, Room = auctionTitle })
                .WithTtl(TimeSpan.FromHours(1));

            var jwt = token.ToJwt();
            return jwt;
        }
    }
}