import type { Route } from "./+types/home";
import { useEffect, useState } from "react";
import "@splidejs/react-splide/css";
import type { AuctionCard } from "../services/types";
import CarouselAuctionCard from "~/components/auctionCard";
import { getAllAuctions } from "~/services/fetchService";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const [auctions, setAuctions] = useState<AuctionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAuctions() {
      try {
        const data = await getAllAuctions();
        const activeAuctions = data.filter((auction: AuctionCard) => auction.status === 1);
        setAuctions(activeAuctions);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar las subastas:", err);
        setError("Error al cargar las subastas");
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);
  if (loading) {
    return <div className="p-6 text-white">Cargando subastas...</div>;
  }
  if (error) {
    return <div className="p-6 text-white">Error: {error}</div>;
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 flex flex-col text-center">Subastas disponibles</h1>

      <div>
        <CarouselAuctionCard auction={auctions} />
      </div>
    </div>
  );
}


