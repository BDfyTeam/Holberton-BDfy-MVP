import { Link } from "react-router";
import type { Auction } from "~/services/types";
import categorys from "~/services/categorys";
import { MapPin, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import AddLot from "./addLot";
import UpdateAuctionButton from "./PUTAuction";

type Props = {
  auction: Auction;
  edit?: boolean;
  className?: string;
};

export default function AuctionCard({
  auction,
  className,
  edit = false,
}: Props) {
  const [showAddLot, setShowAddLot] = useState(false);
  const [showEditAuction, setShowEditAuction] = useState(false);

  return (
    <div className={className}>
      <div
        className="w-full h-[400px] min-w-[350] max-w-[450] min-h-[400px] max-h-[500px] bg-[#0D4F61] rounded-2xl 
        overflow-hidden my-4 hover:transform hover:scale-107 transition-all duration-400 relative shadow-black shadow-2xl"
      >
        {edit && (
          <button
            onClick={() => setShowEditAuction(true)}
            className="absolute top-2 left-2 z-20 bg-[#0D4F61]/30 backdrop-blur-md p-2 rounded-full hover:bg-[#0D4F61]/50"
          >
            <Pencil className="text-[#0D4F61] w-5 h-5" />
          </button>
        )}

        {/* Categorías en la esquina superior derecha */}
        <div className="absolute top-0 right-0 flex gap-2 z-10 bg-[#0D4F61]/80 p-2 rounded-bl-4xl">
          {auction.category.map((catId) => {
            const category = categorys.find((c) => c.id === catId);
            return (
              <span
                key={catId}
                className="text-[#D3E3EB] text-xs font-medium px-3 py-1"
              >
                {category ? (
                  <span className="w-4 h-4">{category.icon}</span>
                ) : (
                  `Categoría ${catId}`
                )}
              </span>
            );
          })}
        </div>

        <Link to={`/auction/specific/${auction.id}`}>
          <div className="w-full h-2/5 z-40">
            <img
              src={
                typeof auction.imageUrl === "string"
                  ? auction.imageUrl
                  : undefined
              }
              alt="Logo Subasta"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="h-3/5 p-4 text-white flex flex-col">
            <h3
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 line-clamp-2"
              style={{
                fontSize: "clamp(0.5rem, 4vw, 1.5rem)",
              }}
            >
              {auction.title}
            </h3>

            <p
              className="text-sm sm:text-sm lg:text-base mb-[1vw] flex-grow overflow-hidden text-ellipsis text-white/75"
              style={{
                fontSize: "clamp(0.5rem, 2vw, 1rem)",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              }}
            >
              {auction.description}
            </p>

            <div className="flex items-center space-x-2 text-xs mb-4">
              <MapPin className="w-10 h-10 text-[#D3E3EB]" />
              <span>
                {auction.direction.street} {auction.direction.streetNumber},
                esq. {auction.direction.corner} - {auction.direction.department}
              </span>
            </div>

            {/* Boton de agregar lotes */}
            {edit && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // evitar que el click dispare el Link
                  e.preventDefault(); // prevenir navegación
                  setShowAddLot(true);
                }}
                className="mt-auto self-center bg-transparent text-white font-semibold py-2 px-6 border-2 
                  rounded-full hover:bg-white hover:text-[#0D4F61] hover:border-white 
                  transition-all duration-300"
              >
                Agregar Lote
              </button>
            )}
          </div>
        </Link>
      </div>

      {showAddLot && (
        <AddLot auction={auction} onClose={() => setShowAddLot(false)} />
      )}

      {showEditAuction && (
        <UpdateAuctionButton
          auction={auction}
          onClose={() => setShowEditAuction(false)}
        />
      )}
    </div>
  );
}
