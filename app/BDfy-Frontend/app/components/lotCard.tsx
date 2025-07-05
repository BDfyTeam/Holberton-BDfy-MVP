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
          className="w-[350px] bg-primary rounded-2xl overflow-hidden
                     border-4 border-accent my-8 hover:scale-105
                     transition-transform duration-300"
        >
          <div className="p-5 text-white flex flex-col h-full space-y-4">
            {/* Nº de lote */}
            <h3 className="text-xl font-bold">Lote #{lot.lotNumber}</h3>

            {/* Descripción */}
            <p className="text-sm text-justify line-clamp-3">
              {lot.description}
            </p>

            {/* Detalles */}
            {lot.details && (
              <p className="text-xs italic text-accent/90">{lot.details}</p>
            )}

            {/* Precios */}
            <div className="mt-auto text-sm space-y-1">
              <p>Inicio: ${lot.startingPrice}</p>
              <p>Actual: ${lot.currentPrice}</p>
              <p>Tope : ${lot.endingPrice}</p>
            </div>

            {/* Categorías heredadas de la subasta */}
            <div className="flex flex-wrap gap-2 pt-2">
              {lot.auction.category.map((id) => {
                const cat = categorys.find((c) => c.id === id);
                return (
                  <span
                    key={id}
                    className="flex items-center gap-1 px-2 py-1 rounded-full
                               border border-accent/40 bg-accent/20
                               text-xs text-accent"
                  >
                    {cat?.icon}
                    {cat?.name}
                  </span>
                );
              })}
            </div>

            {/* Título de la subasta */}
            <div className="flex items-center gap-1 pt-3 text-sm">
              <MapPin className="w-4 h-4 text-accent" />
              {lot.auction.title}
            </div>

            {/* Estado */}
            <div className="pt-2 flex items-center gap-2">
              {lot.sold ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 text-sm">
                    Vendido {lot.winner ? `a ${lot.winner}` : ""}
                  </span>
                </>
              ) : (
                <span className="text-yellow-300 text-sm">Disponible</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
