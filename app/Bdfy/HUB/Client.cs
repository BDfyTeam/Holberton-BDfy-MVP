using BDfy.Dtos;

namespace BDfy.Hub
{
    public interface IClient
    {
        Task ReceiveMessage(string type, string message); // Para recibir mensajes del servidor
        Task ReceiveBid(ReceiveBidDto Bid); // Para recibir la nueva oferta
    }
}