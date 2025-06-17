import { useState, useEffect } from "react";
import CarouselAuctionCard from "~/components/auctionCard";
import AddLot from "~/components/addLot";
import { getAllAuctions } from "~/services/fetchService";
import type { AuctionCard } from "~/services/types";
import UpdateAuctionButton from "~/components/PUTAuction";

export default function MyAuctions() {
  const [activeAuct, setActiveAuct] = useState<AuctionCard[]>([]);
  const [closedAuct, setClosedAuct] = useState<AuctionCard[]>([]);
  const [draftedAuct, setDraftedAuct] = useState<AuctionCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedAuction, setSelectedAuction] = useState<AuctionCard | null>(null);
  const [auctionToEdit, setAuctionToEdit] = useState<AuctionCard | null>(null);

  useEffect(() => {
    async function fetchAuctions() {
      try {
        const data = await getAllAuctions();
        const activeAuctions = data.filter(
          (auction: AuctionCard) => auction.status === 1
        );
        const closedAuctions = data.filter(
          (auction: AuctionCard) => auction.status === 0
        );
        const draftedAuctions = data.filter(
          (auction: AuctionCard) => auction.status === 2
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
    <>
      <div className="p-4 text-white">
        <h2 className="text-2xl font-bold mb-4">Subastas Activas</h2>
        <CarouselAuctionCard auction={activeAuct} />
      </div>

      <div className="p-4 text-white">
        <h2 className="text-2xl font-bold mb-4">Subastas Cerradas</h2>
        <CarouselAuctionCard auction={closedAuct} />
      </div>

      <div className="p-4 text-white ">
        <h2 className="text-2xl font-bold mb-4">Subastas en Borrador</h2>
        <CarouselAuctionCard
          auction={draftedAuct}
          renderAction={(auction: AuctionCard) => (
            <>
              <button
                onClick={() => {
                  setSelectedAuction(auction)
                  console.log("Estoy abriendo")
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
    </>
  );
}
