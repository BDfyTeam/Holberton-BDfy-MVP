using Microsoft.AspNetCore.SignalR;
using BDfy.Dtos;
using BDfy.Data;


namespace BDfy.Hub
{
    public class BdfyHub(BDfyDbContext db) : Hub<IClient>
    {
        protected readonly BDfyDbContext _db = db;
        
        public async Task JoinAuctionGroup(int lotId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"auction_{lotId}");
        }

        public async Task LeaveAuctionGroup(int lotId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"auction_{lotId}");
        }
        
        public async Task SendBid(SendBidDto bid)
        {
            var lot = await _db.Lots.FindAsync(bid.LotId) ?? throw new Exception($"No se encontro el lote: {bid.LotId}");

            if (bid.Amount > lot.CurrentPrice)
            {
                lot.CurrentPrice = bid.Amount;

                await _db.SaveChangesAsync();

                var newBid = new ReceiveBidDto // Lo que le llega al lote
                {
                    LotId = bid.LotId, // Lote
                    CurrentPrice = bid.Amount, // El precio actual con la oferta hecha
                    BuyerId = bid.BuyerId // Se puede extraer del JWT?
                };

                await Clients.All.ReceiveBid(newBid); // Mandamos la nueva puja a todos los clientes(modificar por grupos)
            }
            else
            {
                throw new Exception("Puja rechazada: monto inferior o igual al actual");
            }
        }
    }
}