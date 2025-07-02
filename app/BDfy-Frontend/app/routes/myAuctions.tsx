import { useState, useEffect } from "react";
import BanerCarousel from "~/components/BanerCarousel";
import AddLot from "~/components/addLot";
import { getAuctionsByAuctioneer } from "~/services/fetchService";
import type { Auction, AuctionCard } from "~/services/types";
import UpdateAuctionButton from "~/components/PUTAuction";

export default function MyAuctions() {
  const [activeAuct, setActiveAuct] = useState<Auction[]>([]);
  const [closedAuct, setClosedAuct] = useState<Auction[]>([]);
  const [draftedAuct, setDraftedAuct] = useState<Auction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [auctionToEdit, setAuctionToEdit] = useState<Auction | null>(null);

  useEffect(() => {
    async function fetchAuctions() {
      try {
        const data = await getAuctionsByAuctioneer();
        const activeAuctions = data.filter(
          (auction: Auction) => auction.status === 1
        );
        const closedAuctions = data.filter(
          (auction: Auction) => auction.status === 0
        );
        const draftedAuctions = data.filter(
          (auction: Auction) => auction.status === 2
        );
        setActiveAuct(activeAuctions);
        setClosedAuct(closedAuctions);
        setDraftedAuct(draftedAuctions);
      } catch (error) {
        console.error("Error al cargar las subastas:", error);
        setError("Error al cargar las subastas");
      }
    }
    fetchAuctions();
  }, []);

  return (
    <main>
      <div className="p-4 text-white">
        <h2 className="text-2xl font-bold mb-4">Subastas Activas</h2>
        <BanerCarousel auction={activeAuct} />
      </div>

      <div className="p-4 text-white">
        <h2 className="text-2xl font-bold mb-4">Subastas Cerradas</h2>
        <BanerCarousel auction={closedAuct} />
      </div>

      <div className="p-4 text-white ">
        <h2 className="text-2xl font-bold mb-4">Subastas en Borrador</h2>
        <BanerCarousel
          auction={draftedAuct}
          renderAction={(auction: Auction) => (
            <>
              <button
                onClick={() => {
                  setSelectedAuction(auction)
                }}
                className="bg-green-500 hover:bg-green-700 text-white font-bold px-4 py-2 rounded mr-2"
              >
                Agregar Lote
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAuctionToEdit(auction);
                }}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold px-4 py-2 rounded"
              >
                Editar
              </button>
            </>
          )}
        />
        {selectedAuction && (
          <AddLot
            auction={selectedAuction}
            onClose={() => setSelectedAuction(null)}
          />
        )}
        {auctionToEdit && (
          <UpdateAuctionButton
            auction={auctionToEdit}
            onClose={() => setAuctionToEdit(null)}
          />
        )}
      </div>
    </main>
  );
}
