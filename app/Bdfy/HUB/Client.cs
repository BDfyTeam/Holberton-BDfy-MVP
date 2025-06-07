using BDfy.Dtos;

namespace BDfy.Hub
{
    public interface IClient
    {
        Task ReceiveBid(ReceiveBidDto Bid);
    }
}