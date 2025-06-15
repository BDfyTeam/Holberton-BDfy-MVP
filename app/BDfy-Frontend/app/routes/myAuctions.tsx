import { Splide, SplideSlide } from "@splidejs/react-splide";
import { useState, useEffect } from "react";
import CarouselAuctionCard from "~/components/auctionCard";
import AddLot from "~/components/addLot";
import { getAllAuctions } from "~/services/fetchService";
import type { AuctionCard } from "~/services/types";

export default function MyAuctions() {
  const [activeAuct, setActiveAuct] = useState<AuctionCard[]>([]);
  const [closedAuct, setClosedAuct] = useState<AuctionCard[]>([]);
  const [draftedAuct, setDraftedAuct] = useState<AuctionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAuction, setSelectedAuction] = useState<AuctionCard | null>(
    null
  );

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
      } finally {
        setLoading(false);
      }
    }
    fetchAuctions();
  }, []);

  return (
    <>
      <div className="p-4 text-white">
        <h2 className="text-2xl font-bold mb-4">Subastas Activas</h2>
        <CarouselAuctionCard
          auction={activeAuct}
          renderAction={(auction: AuctionCard) => (
            <button
              onClick={() => setSelectedAuction(auction)}
              className="bg-green-500 text-white font-bold px-4 py-2 rounded"
            >
              Agregar Lote
            </button>
          )}
        />
      </div>

      <div className="p-4 text-white">
        <h2 className="text-2xl font-bold mb-4">Subastas Cerradas</h2>
        <CarouselAuctionCard
          auction={closedAuct}
          renderAction={(auction: AuctionCard) => (
            <button
              onClick={() => setSelectedAuction(auction)}
              className="bg-green-500 text-white font-bold px-4 py-2 rounded"
            >
              Agregar Lote
            </button>
          )}
        />
      </div>

      <div className="p-4 text-white">
        <h2 className="text-2xl font-bold mb-4">Subastas en Borrador</h2>
        <CarouselAuctionCard
          auction={draftedAuct}
          renderAction={(auction: AuctionCard) => (
            <button
              onClick={() => setSelectedAuction(auction)}
              className="bg-green-500 text-white font-bold px-4 py-2 rounded"
            >
              Agregar Lote
            </button>
          )}
        />
      </div>
    </>
  );
}
