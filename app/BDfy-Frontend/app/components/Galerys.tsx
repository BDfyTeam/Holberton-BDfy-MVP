import type { ReactElement } from "react";
import type { Auction, Lot } from "~/services/types";

type Props = {
  auctions?: Auction[];
  lots?: Lot[];
  component: React.ElementType;  
  className?: string;
  internalClassName?: string;
};

export default function Galerys({ auctions, lots, component: Component, className, internalClassName }: Props): ReactElement {
  return (
    <div className={className}>
      {/* Renderizar subastas */}
      {auctions && auctions.length > 0 && (
        <div className={internalClassName}>
          {auctions.map((auction) => (
            <div key={auction.id}>
              {/* Pasa la subasta como prop */}
              <Component auction={auction} className="" />
            </div>
          ))}
        </div>
      )}

      {/* Renderizar lotes */}
      {lots && lots.length > 0 && (
        <div className={internalClassName}>
          {lots.map((lot) => (
            <div key={lot.id}>
              {/* Pasa el lote como prop */}
              <Component lot={lot} className="" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
