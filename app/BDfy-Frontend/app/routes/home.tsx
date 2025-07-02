import type { Route } from "./+types/home";
import { useEffect, useState } from "react";
import "@splidejs/react-splide/css";
import type { Auction, AuctionCard } from "../services/types";
import BanerCarousel from "~/components/BanerCarousel";
import { getAllAuctions, fetchRole } from "~/services/fetchService";
import CreateAuctionButton from "~/components/POSTAuction";
import CreateLotButton from "~/components/POSTLots";
import { useAuth } from "~/context/authContext";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<number | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    async function fetchAuctions() {
      try {
        const data = await getAllAuctions();
        const activeAuctions = data.filter(
          (auction: Auction) => auction.status === 1
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-white space-y-4">
        <div className="w-12 h-12 border-4 border-[#0D4F61] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xl font-semibold text-[#0D4F61] animate-pulse">
          Cargando subastas...
        </p>
      </div>
    );
  }

  return (
    <main>
      <div>
        <BanerCarousel
          auction={auctions}
          className=""
        />
      </div>
      <div className="">
        {isAuthenticated && role === 1 && (
          <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
            <CreateAuctionButton className="bg-[#59b9e2] text-white hover:bg-[#81fff9] hover:text-[#1b3845] transition-all px-7 py-3 rounded-full shadow-lg font-semibold text-xl" />
            <CreateLotButton className="bg-[#59b9e2] text-white hover:bg-[#81fff9] hover:text-[#1b3845] transition-all px-7 py-3 rounded-full shadow-lg font-semibold text-xl" />
          </div>
        )}
      </div>
    </main>
  );
}
