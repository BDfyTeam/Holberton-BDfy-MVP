import { Link } from "react-router";
import type { Auction } from "~/services/types";
import logo from "~/public/assets/auctionHouses/subastasBerrios.png"
import categorys from "~/services/categorys";
import { MapPin } from "lucide-react";


type Props = {
  auction: Auction;
  className?: string;
};

export default function AuctionCard({ auction, className }: Props) {
  return (
    <div className={className ? className : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8"}>
      <Link to={`/auction/specific/${auction.id}`}>
        <div
          className="w-[350px] h-[400px] bg-[#0D4F61] rounded-2xl
          overflow-hidden border-4 border-[#D3E3EB] my-10 hover:transform 
          hover:scale-107 transition-all duration-400"
        >
          <div className="w-full h-2/5">
            <img
              src={logo}
              alt="Logo Subasta"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="h-3/5 p-4 text-white">
            {/* Título */}
            <h3 className="text-2xl font-semibold mb-4">
              {auction.title}
            </h3>

            {/* Descripción */}
            <p className="text-sm mb-4 text-justify">
              {auction.description}
            </p>

            {/* Categorías */}
            <div className="flex flex-wrap gap-2 mb-5">
              {auction.category.map((catId, index) => {
                const category = categorys.find((c) => c.id === catId);
                return (
                  <span
                    key={catId}
                    className="bg-[#D3E3EB]/20 text-[#D3E3EB] text-xs 
                    font-medium px-3 py-1 rounded-full border border-[#D3E3EB]/40"
                  >
                    {category ? (
                      <span className="w-5 h-5">{category.icon}</span>
                    ) : (
                      `Categoría ${catId}`
                    )}
                  </span>
                );
              })}
            </div>

            {/* Dirección */}
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#D3E3EB]" />
              <span>
                {auction.direction.street}{" "}
                {auction.direction.streetNumber}, esq.{" "}
                {auction.direction.corner} -{" "}
                {auction.direction.department}
              </span>
            </div>
          </div>

        </div>
      </Link>
    </div>
  );
}

