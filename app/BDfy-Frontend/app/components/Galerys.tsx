import type { Auction, Lot } from "~/services/types";

type Props = {
  auctions?: Auction[];
  lots?: Lot[];
  component: React.ElementType;  
  className?: string;
};

export default function Galerys({ auctions, lots, component: Component, className }: Props) {
  return (
    <div className={className}>
      {/* Renderizar subastas */}
      {auctions && auctions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {auctions.map((auction) => (
            <div key={auction.id}>
              {/* Pasa la subasta como prop */}
              <Component auction={auction} />
            </div>
          ))}
        </div>
      )}

      {/* Renderizar lotes */}
      {lots && lots.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {lots.map((lot) => (
            <div key={lot.id}>
              {/* Pasa el lote como prop */}
              <Component lot={lot} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
