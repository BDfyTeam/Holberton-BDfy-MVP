import { Link } from "react-router";
import type { Auction } from "~/services/types";
import categorys from "~/services/categorys";
import { MapPin } from "lucide-react";

type Props = {
  auction: Auction;
  className?: string;
};

export default function AuctionCard({ auction, className }: Props) {
  return (
    <div className={className}>
      <Link to={`/auction/specific/${auction.id}`}>
        <div
          className="w-full h-[400px] min-w-[350] max-w-[450] min-h-[400px] max-h-[500px] bg-[#0D4F61] rounded-2xl shadow-3xl 
            overflow-hidden my-4 hover:transform hover:scale-107 transition-all duration-400 relative"
        >
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

          <div className="w-full h-2/5 z-40">
            <img
              src={typeof auction.imageUrl === "string" ? auction.imageUrl : undefined}
              alt="Logo Subasta"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="h-3/5 p-4 text-white flex flex-col">
            {/* Título */}
            <h3
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 line-clamp-2"
              style={{
                fontSize: "clamp(0.5rem, 4vw, 1.5rem)", // Cambia entre 1rem y 2.5rem según el tamaño de la pantalla
              }}
            >
              {auction.title}
            </h3>

            {/* Descripción */}
            <p
              className="text-sm sm:text-sm lg:text-base mb-[1vw] flex-grow overflow-hidden text-ellipsis text-white/75"
              style={{
                fontSize: "clamp(0.5rem, 2vw, 1rem)",
                display: "-webkit-box", // Establece el contenedor como un "box" para truncamiento
                WebkitLineClamp: 3, // Limita el texto a 3 líneas
                WebkitBoxOrient: "vertical", // Necesario para aplicar el truncamiento con line-clamp
              }}
            >
              {auction.description}
            </p>

            {/* Dirección */}
            <div className="flex items-center space-x-2 text-xs mb-4">
              <MapPin className="w-10 h-10 text-[#D3E3EB]" />
              <span className="">
                {auction.direction.street} {auction.direction.streetNumber},
                esq. {auction.direction.corner} - {auction.direction.department}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
