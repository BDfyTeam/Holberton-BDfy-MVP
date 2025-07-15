using BDfy.Data;
using BDfy.Dtos;
using Microsoft.EntityFrameworkCore;

namespace BDfy.Services
{
    public class BiddingHistoryService(BDfyDbContext db)
    {
        public async Task<List<BiddingHistoryDto>> GetAllBidsByLotId(Guid lotId)
		{
			try
			{
				var bids = await db.Bids
					.Include(b => b.Lot)
					.Include(b => b.Buyer)
						.ThenInclude(ud => ud.User)
					.Where(b => b.LotId == lotId)
					.ToListAsync();

				var autoBids = await db.AutoBidConfigs
					.Include(ab => ab.Lot)
					.Include(ab => ab.Buyer)
						.ThenInclude(ud => ud.User)
					.Where(b => b.LotId == lotId)
					.ToListAsync();

				var BidsDto = bids.Select(b => new BiddingHistoryDto
				{
					User = new WinnerDto
					{
						FirstName = b.Buyer.User.FirstName,
						LastName = b.Buyer.User.LastName
					},
					Amount = b.Amount,
					Time = b.Time,
					IsAutoBid = false
				});

				var AutoBidsDto = autoBids.Select(ab => new BiddingHistoryDto
				{
					User = new WinnerDto
					{
						FirstName = ab.Buyer.User.FirstName,
						LastName = ab.Buyer.User.LastName
					},
					Amount = ab.IncreasePrice,
					Time = ab.UpdatedAt,
					IsAutoBid = true
				});

				var BiddingHistory = BidsDto
					.Concat(AutoBidsDto)
					.OrderByDescending(b => b.Time)
					.ToList();

				return BiddingHistory;

			}
			catch (Exception ex)
			{
                throw new Exception($"Error: {ex}");
			}
		}
    }
}