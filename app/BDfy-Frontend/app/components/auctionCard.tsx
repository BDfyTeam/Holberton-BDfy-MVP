import { Splide, SplideSlide } from "@splidejs/react-splide";
import { Link } from "react-router";
import type { AuctionCard } from "~/services/types";
import { useEffect, useRef } from "react";

type CarouselAuctionCardProps = {
  auction: AuctionCard[];
  renderAction?: (auction: AuctionCard) => React.ReactNode;
};

export default function CarouselAuctionCard({ auction, renderAction }: CarouselAuctionCardProps) {
  const promptButton = "Ver Subasta";
  // Esto es para que "breakpoints" funcione correctamente en Splide
  const splideRef = useRef<any>(null); // Referencia para Splide
  
  useEffect(() => {
    // Este efecto se ejecuta cuando el componente se monta
    if (splideRef.current) {
      splideRef.current.refresh(); // Asegura que se aplique la configuración de breakpoints
    }
  }, []); // Dependencias vacías, se ejecuta solo cuando el componente se monta

  if (!auction || auction.length === 0) {
    return (
      <div className="max-w-screen-xl mx-auto">
        <p className="text-center text-gray-500">
          No hay subastas disponibles en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto">
      <Splide
        options={{
          type: "loop",
          perPage: 3,
          arrows: true,
          gap: "1rem",
          focus: "center",
          speed: 1500,
          breakpoints: {
            640: { perPage: 1, gap: "1rem" },
            768: { perPage: 2, gap: "1rem" },
            1024: { perPage: 3, gap: "1rem" },
          },
        }}
      >
        {auction.map((auction) => {
          const url = `/auction/${auction.id}`;
          return (
            <SplideSlide key={auction.id}>
              <div className="bg-white text-black p-4 rounded shadow-lg h-95 w-full flex flex-col justify-between">
                <h2 className="text-xl font-semibold mb-2 flex justify-center text-center">
                  {auction.title}
                </h2>
                <p className="text-sm text-gray-700 mb-3">{auction.description}</p>
                <p className="text-sm text-gray-500 mb-3">
                  Categorías: {auction.category.join(", ")}
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  Dirección: {auction.direction.street} {auction.direction.streetNumber},{" "}
                  {auction.direction.corner}, {auction.direction.zipCode},{" "}
                  {auction.direction.department}
                </p>
                <p className="text-sm text-gray-500">
                  Inicio:{" "}
                  {auction.startAt
                    ? new Date(auction.startAt).toLocaleString()
                    : "Fecha de inicio no definida"}
                </p>
                <p className="text-sm text-gray-500">
                  Fin:{" "}
                  {auction.endAt
                    ? new Date(auction.endAt).toLocaleString()
                    : "Fin de la subasta aún no definido"}
                </p>

                <div className="mt-3 flex justify-center">
                  {renderAction ? (
                    renderAction(auction)
                  ) : (
                    <Link
                      to={url}
                      className="bg-blue-100 text-blue-800 font-semibold py-2 px-4 rounded"
                    >
                      {promptButton}
                    </Link>
                  )}
                </div>
              </div>
            </SplideSlide>
          );
        })}
      </Splide>
    </div>
  );
}