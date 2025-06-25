using BDfy.Dtos;

namespace BDfy.Hub
{
    public interface IClient
    {
        Task ReceiveMessage(string type, string message); // Para recibir mensajes del servidor
        Task ReceiveBid(ReceiveBidDto Bid); // Para recibir la nueva oferta
        Task ReceiveAutoBidDeactivated(object deactivationData); // Para notificar que se cancelo el autoBid del usuario
        Task ReceiveBiddingHistory(List<BiddingHistoryDto> biddingHistory); // Para recibir la lista de pujas del lote
    }
}