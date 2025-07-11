import type { Route } from "./+types/home";
import { useEffect, useState } from "react";
import "@splidejs/react-splide/css";
import type { Auction } from "../services/types";
import BanerCarousel from "~/components/BanerCarousel";
import { getAllAuctions, fetchRole } from "~/services/fetchService";
import CreateAuctionButton from "~/components/POSTAuction";
import CreateLotButton from "~/components/POSTLots";
import { useAuth } from "~/context/authContext";
import FiltersIcons from "~/components/FiltersIcons";
import HotCarusel from "~/components/HotCarusel";
import AuctionCard from "~/components/AuctionCard";
import Galetys from "~/components/Galerys";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const [banerAuctions, setBanerAuctions] = useState<Auction[]>([]);
  const [hotAuctions, setHotAuctions] = useState<Auction[]>([]);
  const [allAuctions, setAllAuctions] = useState<Auction[]>([]);
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

        const now = new Date();
        const oneWeekLater = now.getTime() + 7 * 24 * 60 * 60 * 1000;

        const hotAuctions = activeAuctions.filter((auction: Auction) => {
          const endDate = auction.endAt ? new Date(auction.endAt).getTime() : 0;
          return endDate < oneWeekLater;
        });

        // Ordenar las subastas según el startingPrice del lote más caro
        const sortedAuctions = activeAuctions.sort((a: Auction, b: Auction) => {
          const highestLotA = Math.max(
            ...a.lots.map((lot) => lot.startingPrice)
          );
          const highestLotB = Math.max(
            ...b.lots.map((lot) => lot.startingPrice)
          );
          return highestLotB - highestLotA; // Compara el precio más alto entre los lotes
        });
        // Tomar solo las 3 subastas con el startingPrice más alto en su lote
        const topThreeAuctions = sortedAuctions.slice(0, 3);
        setBanerAuctions(topThreeAuctions);
        setHotAuctions(hotAuctions);
        setAllAuctions(activeAuctions);
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
    <>
      <div>
        <BanerCarousel
          auction={banerAuctions}
          className="w-full overflow-hidden"
        />
      </div>

      <div className="w-3/4 h-0.5 mx-auto my-10 bg-[#0D4F61]"></div>

      <div className="w-6/8 mx-auto mb-8">
        <FiltersIcons className="grid grid-cols-6 gap-1" />
      </div>

      <div className="w-3/4 h-0.5 mx-auto my-10 bg-[#0D4F61]"></div>

      <HotCarusel
        auction={hotAuctions}
        className="w-full p-20 shadow-lg mx-auto my-20"
      />

      <Galetys 
        auctions={allAuctions}
        component={AuctionCard}
        className="my-10 w-3/4"
      />

      <div className="">
        {isAuthenticated && role === 1 && (
          <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
            <CreateAuctionButton className="bg-[#59b9e2] text-white hover:bg-[#81fff9] hover:text-[#1b3845] transition-all px-7 py-3 rounded-full shadow-lg font-semibold text-xl" />
            <CreateLotButton className="bg-[#59b9e2] text-white hover:bg-[#81fff9] hover:text-[#1b3845] transition-all px-7 py-3 rounded-full shadow-lg font-semibold text-xl" />
          </div>
        )}
      </div>
    </>
  );
}
