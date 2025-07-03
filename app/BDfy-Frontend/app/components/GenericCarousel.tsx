import { Splide, SplideSlide } from "@splidejs/react-splide";
import { Link } from "react-router";
import type { AuctionCard } from "~/services/types";
import { useEffect, useRef } from "react";
import pengu from "app/public/assets/ConfusedPengu.png";
import categorys from "~/services/categorys";

type Props = {
  auction: AuctionCard[];
  renderAction?: (auction: AuctionCard) => React.ReactNode;
  className?: string;
  options?: {
    type?: string;
    perPage?: number;
    arrows?: boolean;
    gap?: string;
    focus?: string;
    speed?: number;
    breakpoints?: {
      [key: number]: {
        perPage?: number;
        gap?: string;
      };
    };
  };
};

const defaultOptions = {
  type: "loop",
  perPage: 1,
  arrows: true,
  speed: 1500,
};

export default function GenericCarousel({
  auction,
  renderAction,
  className,
  options,
}: Props) {
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
        <img src={pengu} alt="Sin subastas" className="w-48 h-48 opacity-70" />
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
        options={options ? options : defaultOptions}
      >
        {auction.map((auction) => {
          const url = `/auction/specific/${auction.id}`;
          return (
            <SplideSlide key={auction.id}>
              {/* Titulo */}
              <div className="">
                <h2 className="" style={{ fontFamily: "Montserrat" }}>
                  {auction.title}
                </h2>

                {/* Descripcion */}
                <p className="">{auction.description}</p>

                {/* Categorias */}
                <div className="">
                  <span className="">Categorías:</span>
                  <div className="">
                    {auction.category.map((catId, index) => {
                      const name = categorys[catId as keyof typeof categorys];
                      return (
                        <span key={index} className="">
                          {name ?? `Categoría ${catId}`}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Direccion */}
                <div className="">
                  <span className="">Dirección:</span>
                  <p className="">
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
