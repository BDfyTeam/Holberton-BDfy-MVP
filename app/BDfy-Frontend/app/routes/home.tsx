import type { Route } from "./+types/home";
import { useEffect, useState } from "react";
import "@splidejs/react-splide/css";
import type { AuctionCard } from "../services/types";
import CarouselAuctionCard from "~/components/auctionCard";
import { getAllAuctions, fetchRole } from "~/services/fetchService";
import CreateAuctionButton from "~/components/auctionForm";
import CreateLotButton from "~/components/lotForm";
import { useAuth } from "~/context/authContext";

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
  const [role, setRole] = useState<number | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    async function fetchAuctions() {
      try {
        const data = await getAllAuctions();
        const activeAuctions = data.filter(
          (auction: AuctionCard) => auction.status === 1
        );
        setAuctions(activeAuctions);
      } catch (err) {
        console.error("Error al cargar las subastas:", err);
        setError("Error al cargar las subastas");
      } finally {
        setLoading(false);
      }
    }

    fetchAuctions();
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const data = await fetchRole(); // Llamamos a la función asíncrona
        if (data) {
          setRole(data.role); // Establecemos el rol del usuario
        }
      } catch (error) {
        console.error("Error al obtener el rol del usuario:", error);
      }
    };

    if (isAuthenticated) {
      fetchUserRole();
    }
  }, [isAuthenticated]);

  if (loading) {
    return <div className="p-6 text-white">Cargando subastas...</div>;
  }

  return (
    <main>
      <div className="p-6 text-white">
        <h1 className="text-3xl font-bold mb-6 flex flex-col text-center">
          Subastas disponibles
        </h1>
        <div>
          <CarouselAuctionCard auction={auctions} />
        </div>
      </div>
      <div className="">
        {isAuthenticated && role === 1 && (
          <>
            <CreateAuctionButton />
            <CreateLotButton />
          </>
        )}
      </div>
    </main>
  );
}
