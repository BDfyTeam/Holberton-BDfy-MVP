import { Link } from "react-router-dom";
import { CheckCircle2, MapPin } from "lucide-react";
import type { CompleteLot } from "~/services/types";
import categorys from "~/services/categorys";

type Props = { lot: CompleteLot; className?: string };

export default function LotCard({ lot, className }: Props) {
  return (
    <div className={className ?? "w-fit"}>
      <Link to={`/lot/${lot.id}`} className="block">
        <div
          className="w-[350px] bg-[#0D4F61] border border-white rounded-2xl p-6 text-white flex flex-col justify-between hover:scale-105 transform transition duration-300 my-8"
        >
          {/* — Header: número y detalles opcionales */}
          <div>
            <h3 className="text-xl font-bold mb-2">Lote #{lot.lotNumber}</h3>
            {lot.details && (
              <p className="text-xs italic opacity-90 mb-4">
                {lot.details}
              </p>
            )}
          </div>

          {/* — Descripción */}
          <p className="text-sm mb-4 line-clamp-3">
            {lot.description}
          </p>

          {/* — Precios */}
          <div className="space-y-1 mb-4 text-sm">
            <p>Inicio: ${lot.startingPrice}</p>
            <p>Actual: ${lot.currentPrice}</p>
            <p>Tope: ${lot.endingPrice}</p>
          </div>

          {/* — Badges de categoría */}
          <div className="flex flex-wrap gap-2 mb-4">
            {lot.auction.category.map((id) => {
              const cat = categorys.find((c) => c.id === id);
              return (
                <span
                  key={id}
                  className="
                    flex items-center gap-1
                    border border-white
                    px-3 py-1
                    rounded-full
                    text-xs
                  "
                >
                  {cat?.icon}
                  {cat?.name}
                </span>
              );
            })}
          </div>

          {/* — Título de la subasta */}
          <div className="flex items-center gap-2 mb-2 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{lot.auction.title}</span>
          </div>

          {/* — Estado */}
          <div>
            {lot.sold ? (
              <span className="flex items-center gap-1 text-yellow-300 text-sm">
                <CheckCircle2 className="w-4 h-4 text-yellow-300" />
                Vendido{lot.winner ? ` a ${lot.winner}` : ""}
              </span>
            ) : (
              <span className="text-yellow-300 text-sm">Disponible</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
