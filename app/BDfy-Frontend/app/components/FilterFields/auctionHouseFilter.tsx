import { useEffect, useState } from "react";
import type { Auction } from "~/services/types";

interface Props {
  auctions: Auction[];
  currentAuctionHouse: string;
  onAuctionHouseChange: (value: string) => void;
}

export default function AuctionHouseFilter({
  auctions,
  currentAuctionHouse,
  onAuctionHouseChange,
}: Props) {
  const [houses, setHouses] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const uniqueHouses = Array.from(
      new Set(
        auctions
          .map((a) => a.auctioneer?.auctionHouse)
          .filter((name): name is string => !!name)
      )
    );
    setHouses(uniqueHouses);
  }, [auctions]);

  const visibleHouses = showAll ? houses : houses.slice(0, 5);

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-sm text-gray-700">Casa de subasta</label>
      <select
        className="rounded-xl border border-gray-300 px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        value={currentAuctionHouse}
        onChange={(e) => onAuctionHouseChange(e.target.value)}
      >
        <option value="">Todas</option>
        {visibleHouses.map((house) => (
          <option key={house} value={house}>
            {house}
          </option>
        ))}
      </select>
      {houses.length > 5 && (
        <button
          type="button"
          className="text-blue-500 text-sm hover:underline w-fit"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Mostrar menos" : "Mostrar más"}
        </button>
      )}
    </div>
  );
}
