import { useState, type ReactElement } from "react";
import type { Auction, Lot } from "~/services/types";

type Props = {
  auctions?: Auction[];
  lots?: Lot[];
  component: React.ElementType;
  className?: string;
  internalClassName?: string;
};

export default function Galerys({
  auctions,
  lots,
  component: Component,
  className,
  internalClassName,
}: Props): ReactElement {
  const [visibleAuctions, setVisibleAuctions] = useState(12);
  const [visibleLots, setVisibleLots] = useState(12);

  // Setea las subastas para mostrar 12 a la vez
  function loadMoreAuctions() {
    setVisibleAuctions((prev) => prev + 12);
  }

  // Setea los lotes para mostrar 12 a la vez
  function loadMoreLots() {
    setVisibleLots((prev) => prev + 12);
  }

  return (
    <div className={className}>
      {/* Renderizar subastas */}
      {auctions && auctions.length > 0 && (
        <div className={internalClassName}>
          {auctions.slice(0, visibleAuctions).map((auction) => (
            <div key={auction.id}>
              {/* Pasa la subasta como prop */}
              <Component auction={auction} className="" />
            </div>
          ))}
          {visibleAuctions < auctions.length && (
            <button
              onClick={loadMoreAuctions}
              className="px-4 py-2 mt-4 rounded bg-[#0D4F61] text-white font-semibold hover:bg-[#0D4F61]/80"
            >
              Ver más subastas
            </button>
          )}
        </div>
      )}

      {/* Renderizar lotes */}
      {lots && lots.length > 0 && (
        <div className={internalClassName}>
          {lots.slice(0, visibleLots).map((lot) => (
            <div key={lot.id}>
              {/* Pasa el lote como prop */}
              <Component lot={lot} className="" />
            </div>
          ))}
          {visibleLots < lots.length && (
            <button
              onClick={loadMoreAuctions}
              className="px-4 py-2 mt-4 rounded bg-[#0D4F61] text-white font-semibold hover:bg-[#0D4F61]/80"
            >
              Ver más lotes
            </button>
          )}
        </div>
      )}
    </div>
  );
}
