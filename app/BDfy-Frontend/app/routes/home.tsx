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
import Galerys from "~/components/Galerys";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "BDfy Simple y Seguro" },
    { name: "description", content: "Welcome to BDFY!" },
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
  const [isCategorySelected, setIsCategorySelected] = useState(false);

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
        const data = await fetchRole();
        if (data) {
          setRole(data.role);
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
        <FiltersIcons
          className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-1"
          setAuction={setAllAuctions}
          setIsCategorySelected={setIsCategorySelected}
        />
      </div>

      <div className="w-3/4 h-0.5 mx-auto my-10 bg-[#0D4F61]"></div>

      {isCategorySelected ? (
        <Galerys
          auctions={allAuctions}
          component={AuctionCard}
          className="flex w-4/5 mx-auto flex-col items-center justify-center p-1"
          internalClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        />
      ) : (
        <HotCarusel
          auction={hotAuctions}
          className="w-full p-20 shadow-lg mx-auto my-20"
        />
      )}

      <div className="">
        {isAuthenticated && role === 1 && (
          <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
            <CreateAuctionButton
              className="bg-[#41c4ae] text-[#0D4F61] hover:text-[#072831] hover:bg-[#1aac93] transition-all px-7 py-3 rounded-full 
                shadow-lg shadow-gray-700 font-semibold text-xl duration-300"
            />
            <CreateLotButton
              className="bg-[#41c4ae] text-[#0D4F61] hover:text-[#072831] hover:bg-[#1aac93] transition-all px-7 py-3 rounded-full 
                shadow-lg shadow-gray-700 font-semibold text-xl duration-300"
            />
          </div>
        )}
      </div>
    </>
  );
}
