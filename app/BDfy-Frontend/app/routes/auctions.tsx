import type { Auction } from "../services/types";
import { useEffect, useState } from "react";
import { getAllAuctions, fetchRole } from "~/services/fetchService";
import AuctionCard from "~/components/AuctionCard";
import SearchBar from "~/components/FilterFields/searchBar";
import Galerys from "~/components/Galerys";
import StatusFilter from "~/components/FilterFields/statusFilter";
import CategoryFilter from "~/components/FilterFields/categoryFilter";
import DateFields from "~/components/FormFields/AucLotCreationFields/Date";

export default function Auctions() {
  const [allAuctions, setAllAuctions] = useState<Auction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [isCategorySelected, setIsCategorySelected] = useState(false);
  const [startAtFilter, setStartAtFilter] = useState<Date | null>(null);
  const [endAtFilter, setEndAtFilter] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchAuctions() {
      try {
        const data = await getAllAuctions();
        const closedActiveAuctions = data.filter(
          (auction: Auction) => auction.status === 1 || auction.status === 0
        );
        const now = new Date();
        const oneWeekLater = now.getTime() + 7 * 24 * 60 * 60 * 1000;

        setAllAuctions(closedActiveAuctions);
      } catch (err) {
        console.error("Error al cargar las subastas:", err);
        setError("Error al cargar las subastas");
      } finally {
        setLoading(false);
      }
    }
    fetchAuctions();
  }, []);

  const getFilteredAuctions = () => {
    let filtered = allAuctions;

    if (searchTerm) {
      filtered = filtered.filter((auction) =>
        auction.title
          .toLowerCase()
          .split(" ")
          .some((word) => word.startsWith(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter) {
      if (statusFilter === "active") {
        filtered = filtered.filter((auction) => auction.status === 1);
      } else if (statusFilter === "closed") {
        filtered = filtered.filter((auction) => auction.status === 0);
      }
    }

    if (categoryFilter) {
      filtered = filtered.filter((auction) => 
        auction.category && auction.category.includes(categoryFilter)
      );
    }
    if (startAtFilter && endAtFilter) {
      filtered = filtered.filter((auction) => {
        const start = new Date(auction.startAt).getTime();
        const from = startAtFilter.getTime();
        const to = endAtFilter.getTime();
        return start >= from && start <= to;
      });
    }

    return filtered;
  };

  const filteredAuctions = getFilteredAuctions();

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
    <div className="flex mb-8 mt-22">
      <div className="flex flex-col w-1/4 mx-auto bg-white rounded rounded-2xl px-3 pt-1 rounded-xl border border-gray-300 text-gray-700">
        <div className="mt-2">
          <SearchBar 
            className="relative w-full max-w-md mx-auto transition-transform duration-300 hover:scale-102"
            placeHolder="¿Qué subasta estás buscando?"
            onSearch={setSearchTerm}
            classNameIcon="absolute top-1/2 left-3 transform -translate-y-1/2 text-blue-400"
            classNameInput="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 bg-white/90 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
          />
        </div>
        <div className="mt-3">
          <StatusFilter 
            className=""
            onStatusChange={setStatusFilter}
            currentStatus={statusFilter}
          />
        </div>
        <div className="mt-3">
          <CategoryFilter
            onCategoryChange={setCategoryFilter} 
            currentCategory={categoryFilter}
            setIsCategorySelected={setIsCategorySelected}
            className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-1"
          />
        </div>
        <div className="mt-3">
          <DateFields
            className="flex gap-4"
            startAt={startAtFilter}
            endAt={endAtFilter}
            setStartAt={setStartAtFilter}
            setEndAt={setEndAtFilter}
          />
        </div>
        <div className="mt-3">
          <p>Filtro por casa de subasta</p>
        </div>
        <div className="mt-3">
          <p>Filtro por departamento</p>
        </div>
      </div>
      <div className="flex w-3/4 mx-auto">
        <Galerys
          auctions={filteredAuctions}
          component={AuctionCard}
          className="flex w-4/5 mx-auto flex-col items-center"
          internalClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        />
      </div>
    </div>
  );
}