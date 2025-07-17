using Microsoft.AspNetCore.SignalR;
using BDfy.Dtos;
using BDfy.Data;
using BDfy.Services;
using System.Collections.Concurrent;

namespace BDfy.Hub
{
    public class BdfyHub(BDfyDbContext db, BiddingHistoryService _bh) : Hub<IClient>
    {
        protected readonly BDfyDbContext _db = db;

        // Diccionario para trackear que usuarios estan en que grupos
        private static readonly ConcurrentDictionary<string, string> _userGroups = new();

        public override async Task OnConnectedAsync() // Para ver si esta conectado al HUB
        {
            Console.WriteLine($"Cliente conectado: {Context.ConnectionId} - {DateTime.Now:HH:mm:ss}");

            await Clients.Caller.ReceiveMessage("system", "Conectado exitosamente al hub"); // Mensaje de confirmacion al cliente

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception) // Para ver si se desconecta del HUB
        {
            if (exception != null) { Console.WriteLine($"   Razon: {exception.Message}"); Console.WriteLine($"[HUB] Stack trace: {exception.StackTrace}");}

            _userGroups.TryRemove(Context.ConnectionId, out _);

            Console.WriteLine($"Cliente desconectado: {Context.ConnectionId} - {DateTime.Now:HH:mm:ss}");

            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinAuctionGroup(Guid lotId) // Para unirse a un grupo (segun el lotId)
        {
            try
            {
                Console.WriteLine($"Intentando unirse al grupo del lote {lotId} - {Context.ConnectionId}");

                var lot = await _db.Lots.FindAsync(lotId);
                if (lot == null) { await Clients.Caller.ReceiveMessage("error", $"Lote {lotId} no encontrado"); return; }

                if (_userGroups.TryGetValue(Context.ConnectionId, out string? previousGroup)) { await Groups.RemoveFromGroupAsync(Context.ConnectionId, previousGroup); } // Saca al cliente de algun grupo anterior 

                // Unirse al nuevo grupo
                string groupName = $"auction_{lotId}";
                await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

                // Actualizar tracking
                _userGroups[Context.ConnectionId] = groupName;

                await Clients.Caller.ReceiveMessage("success", $"Unido al grupo de subasta: {lotId}");

                var currentBid = new ReceiveBidDto // Envia el estado actual del lote al cliente recien conectado
                {
                    LotId = lotId,
                    CurrentPrice = lot.CurrentPrice,
                    BuyerId = Guid.Empty,
                    IsAutoBid = false
                };

                await Clients.Caller.ReceiveBid(currentBid);

                var BiddingHistory = await _bh.GetAllBidsByLotId(lotId);

                await Clients.Caller.ReceiveBiddingHistory(BiddingHistory);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR JoinAuctionGroup] {ex.Message}");
                await Clients.Caller.ReceiveMessage("error", $"Error al unirse al grupo: {ex.Message}");
            }
        }

        public async Task LeaveAuctionGroup(Guid lotId) // Para dejar de recibir actualizaciones de ese lote
        {
            try
            {
                string groupName = $"auction_{lotId}";
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

                _userGroups.TryRemove(Context.ConnectionId, out _);  // Limpiar tracking

                await Clients.Caller.ReceiveMessage("success", $"Saliste del grupo: {lotId}");
            }
            catch (Exception ex)
            {
                await Clients.Caller.ReceiveMessage("error", $"Error al salir del grupo: {ex.Message}");
            }
        }

        public async Task SendBid(SendBidDto bid) // Tarea que manda la nueva puja a todos los clientes conectados al grupo
        {
            try
            {
                var lot = await _db.Lots.FindAsync(bid.LotId);

                if (lot == null) { await Clients.Caller.ReceiveMessage("error", $"Lote {bid.LotId} no encontrado"); return; } // Mandamos error al cliente si el lote no existe

                if (bid.Amount > lot.CurrentPrice)
                {
                    var previousPrice = lot.CurrentPrice;
                    lot.CurrentPrice = bid.Amount;

                    await _db.SaveChangesAsync();

                    var newBid = new ReceiveBidDto // Creamos la nueva oferta
                    {
                        LotId = bid.LotId,
                        CurrentPrice = bid.Amount,
                        BuyerId = bid.BuyerId,
                        Timestamp = DateTime.UtcNow,
                        IsAutoBid = bid.IsAutoBid
                    };

                    string groupName = $"auction_{bid.LotId}";
                    await Clients.Group(groupName).ReceiveBid(newBid); // Manda la nueva oferta a todos los clientes conectados al grupo
                }
                else
                {
                    await Clients.Caller.ReceiveMessage("error",
                        $"Puja rechazada: ${bid.Amount} debe ser mayor que ${lot.CurrentPrice}"); // Mandamos error al cliente
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error procesando puja: {ex.Message}");
                await Clients.Caller.ReceiveMessage("error", $"Error procesando puja: {ex.Message}");
            }
        }

    }
}
