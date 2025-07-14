import { Link } from "react-router";
import type { Auction } from "~/services/types";
import categorys from "~/services/categorys";
import { MapPin, Pencil } from "lucide-react";
import { useState } from "react";
import AddLot from "./addLot";
import UpdateAuctionButton from "./PUTAuction";

type Props = {
  auction: Auction;
  edit?: boolean;
  className?: string;
};

export default function AuctionCard({ auction, className, edit = false }: Props) {
  const [showAddLot, setShowAddLot] = useState(false);
  const [showEditAuction, setShowEditAuction] = useState(false);

  return (
    <div className={className}>
      <div
        className="w-full h-[400px] min-w-[350] max-w-[450] min-h-[400px] max-h-[500px] bg-[#0D4F61] rounded-2xl shadow-3xl 
        overflow-hidden my-4 hover:transform hover:scale-107 transition-all duration-400 relative"
      >
        {edit && (
          <button
            onClick={() => setShowEditAuction(true)}
            className="absolute top-2 left-2 z-20 bg-[#ffffff22] backdrop-blur-md p-2 rounded-full hover:bg-[#ffffff33]"
          >
            <Pencil className="text-white w-5 h-5" />
          </button>
        )}

        {edit && (
          <button
            onClick={() => setShowAddLot(true)}
            className="absolute bottom-2 right-2 z-20 bg-green-500 hover:bg-green-700 text-white font-bold px-4 py-2 rounded"
          >
            Agregar Lote
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
              src={typeof auction.image === "string" ? auction.image : undefined}
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
          </div>
        </Link>
      </div>

      {showAddLot && (
        <AddLot auction={auction} onClose={() => setShowAddLot(false)} />
      )}

      {showEditAuction && (
        <UpdateAuctionButton auction={auction} onClose={() => setShowEditAuction(false)} />
      )}
    </div>
  );
}
