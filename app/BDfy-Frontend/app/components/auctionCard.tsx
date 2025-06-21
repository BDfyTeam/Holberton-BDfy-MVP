import { Splide, SplideSlide } from "@splidejs/react-splide";
import { Link } from "react-router";
import type { AuctionCard } from "~/services/types";
import { useEffect, useRef } from "react";
import pengu from "app/public/assets/ConfusedPengu.png"

type CarouselAuctionCardProps = {
  auction: AuctionCard[];
  renderAction?: (auction: AuctionCard) => React.ReactNode;
  className?: string;
};

export default function CarouselAuctionCard({ auction, renderAction, className, }: CarouselAuctionCardProps) {
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
      <div className="max-w-screen-xl mx-auto py-20 flex flex-col items-center text-center space-y-6">
        <img
          src={pengu}
          alt="Sin subastas"
          className="w-48 h-48 opacity-70"
        />
        <p className="text-lg text-gray-400 font-medium">
          No hay subastas disponibles en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <Splide
        key={auction.length}
        options={{
          type: "loop",
          perPage: 4,
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
        {/* Style necesario para mover las flechas hacia afuera */}
        <style>{` 
          .splide__arrow--prev {
          left: -4rem;
          }

          .splide__arrow--next {
          right: -4rem;
          }
        `}
        </style>
        {auction.map((auction) => {
          const url = `/auction/specific/${auction.id}`;
          return (
            <SplideSlide key={auction.id}>
              {/* Titulo */}
              <div className="bg-[#1b3845]/70 text-white p-5 rounded-xl border border-[#59b9e2]/40 shadow-md backdrop-blur-sm h-[420px] w-full flex flex-col justify-between transform transition-transform duration-300 hover:scale-101 hover:z-10">
                <h2
                  className="text-2xl font-extrabold text-[#6cf2ff] mb-3 text-center tracking-wide"
                  style={{ fontFamily: "Montserrat" }}
                >
                  {auction.title}
                </h2>

                {/* Descripcion */}
                <p className="text-base text-center text-white font-medium leading-relaxed mb-4">
                  {auction.description}
                </p>

                {/* Categorias */}
                <div className="mb-4">
                  <span className="block text-sm text-[#59b9e2] font-semibold mb-2">
                    Categorías:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {auction.category.map((cat, index) => (
                      <span
                        key={index}
                        className="bg-[#59b9e2]/20 text-[#59b9e2] text-xs font-medium px-3 py-1 rounded-full border border-[#59b9e2]/40"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direccion */}
                <div className="mb-4">
                  <span className="block text-sm text-[#59b9e2] font-semibold mb-2">
                    Dirección:
                  </span>
                  <p className="text-sm text-white leading-relaxed">
                    {auction.direction.street} {auction.direction.streetNumber},{" "}
                    {auction.direction.corner}, {auction.direction.zipCode},{" "}
                    {auction.direction.department}
                  </p>
                </div>

                {/* Fechas inicio/fin */}
                <div className="mb-4">
                  <span className="block text-sm text-[#59b9e2] font-semibold mb-2">
                    Fechas de la subasta:
                  </span>
                  <div className="space-y-1 text-sm text-white leading-snug">
                    <p>
                      <span className="font-semibold text-[#81fff9]">
                        Inicio:
                      </span>{" "}
                      {auction.startAt
                        ? new Date(auction.startAt).toLocaleString()
                        : "Fecha de inicio no definida"}
                    </p>
                    <p>
                      <span className="font-semibold text-[#81fff9]">Fin:</span>{" "}
                      {auction.endAt
                        ? new Date(auction.endAt).toLocaleString()
                        : "Fin de la subasta aún no definido"}
                    </p>
                  </div>
                </div>

                {/* Botones */}
                <div className="mt-3 flex justify-center">
                  {renderAction ? (
                    renderAction(auction)
                  ) : (
                    <Link
                      to={url}
                      className="bg-[#81fff9] text-[#1b3845] font-semibold py-2 px-6 rounded-full transition-all duration-300 hover:bg-white hover:text-[#1b3845] hover:shadow-md"
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
