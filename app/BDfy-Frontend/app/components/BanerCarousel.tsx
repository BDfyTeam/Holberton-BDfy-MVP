import { Splide, SplideSlide } from "@splidejs/react-splide";
import { Link } from "react-router";
import type { Auction } from "~/services/types";
import { useEffect, useRef } from "react";
import pengu from "app/public/assets/ConfusedPengu.png";
import joyas from "app/public/assets/lots/joyas.jpg"
import categorys from "~/services/categorys";

type Props = {
  auction: Auction[];
  renderAction?: (auction: Auction) => React.ReactNode;
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

export default function BanerCarousel({
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
      <Splide key={auction.length} options={options ? options : defaultOptions}>
        {auction.map((auctionItem) => {
          const url = `/auction/specific/${auctionItem.id}`;
          return (
            <SplideSlide key={auctionItem.id}>
              {/* Carrousel de las 3 imágenes estáticas por subasta */}
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">{auctionItem.title}</h2>

                {/* Mostrar 3 imágenes estáticas, una por cada lote de la subasta */}
                <div className="flex justify-center space-x-4">
                  {auctionItem.lots.slice(0, 3).map((lot, index) => (
                    <div key={index} className="p-4">
                      <img
                        src={joyas} // Imagen estática utilizada para todos los lotes
                        alt={`Lote ${index + 1}`}
                        className="w-64 h-64 object-cover rounded-lg mb-2"
                      />
                    </div>
                  ))}
                </div>

                {/* Botón para ver más */}
                <div className="mt-3 flex justify-center">
                  <Link
                    to={url}
                    className="bg-[#81fff9] text-[#1b3845] font-semibold py-2 px-6 rounded-full transition-all duration-300 hover:bg-white hover:text-[#1b3845] hover:shadow-md"
                  >
                    {promptButton}
                  </Link>
                </div>
              </div>
            </SplideSlide>
          );
        })}
      </Splide>
    </div>
  );
}
