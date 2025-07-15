import { useState, useEffect } from "react";
import BanerCarousel from "~/components/BanerCarousel";
import AddLot from "~/components/addLot";
import { getAuctionsByAuctioneer } from "~/services/fetchService";
import type { Auction } from "~/services/types";
import UpdateAuctionButton from "~/components/PUTAuction";
import Galerys from "~/components/Galerys";
import AuctionCard from "~/components/AuctionCard";

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
        <h2 className="text-2xl font-bold mb-4 mt-22">Subastas Activas</h2>
        <Galerys
          auctions={activeAuct}
          component={AuctionCard}
          className="flex w-4/5 mx-auto flex-col items-center justify-center p-1"
          internalClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        />
      </div>

      <div className="p-4 text-white">
        <h2 className="text-2xl font-bold mb-4">Subastas Cerradas</h2>
        <Galerys
          auctions={closedAuct}
          component={AuctionCard}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          internalClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        />
      </div>

      <div className="p-4 text-white ">
        <h2 className="text-2xl font-bold mb-4">Subastas en Borrador</h2>
        <Galerys
          auctions={draftedAuct}
          component={(props) => <AuctionCard {...props} edit={true} />}
          className="flex w-4/5 mx-auto flex-col items-center justify-center p-1"
          internalClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
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
            className=""
          />
        )}
      </div>
    </main>
  );
}
