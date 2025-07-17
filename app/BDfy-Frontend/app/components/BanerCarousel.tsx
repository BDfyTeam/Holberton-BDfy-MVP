import { Splide, SplideSlide } from "@splidejs/react-splide";
import { Link } from "react-router";
import type { Auction } from "~/services/types";
import { useEffect, useRef } from "react";
import pengu from "app/public/assets/ConfusedPengu.png";
import categorys from "~/services/categorys";
import {
  Calendar,
  CalendarOff,
  MapPin,
} from "lucide-react";
import { formatDate } from "~/services/formats";

type Props = {
  auction: Auction[];
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
  className,
  options,
}: Props) {
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
            <SplideSlide key={auctionItem.id} className="w-full">
              <div className="w-full h-[500px] flex">
                {/* Contenedor con bordes redondeados */}
                <div
                  className="absolute top-63 left-0 w-auto bg-[#0D4F61]/75 
                  rounded-tr-4xl rounded-br-4xl rounded-tl-none rounded-bl-none px-15 py-4"
                >
                  <h3 className="text-2xl font-semibold text-white mb-1">
                    {auctionItem.title}
                  </h3>

                  <div className="flex flex-wrap gap-2 mb-1">
                    {auctionItem.category.map((catId, index) => {
                      // Encontrar la categoría por su id
                      const category = categorys.find((c) => c.id === catId);

                      return (
                        <span
                          key={index}
                          className="bg-[#D3E3EB]/20 text-[#D3E3EB] text-xs font-medium px-3 py-1 rounded-full border border-[#D3E3EB]/40"
                        >
                          {/* Mostrar el nombre de la categoría */}
                          {category ? category.name : `Categoría ${catId}`}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex items-center space-x-2 mb-1 text-white text-sm">
                    <Calendar className="inline mr-1 w-5 h-5" />
                    <span>{formatDate(auctionItem.startAt)}</span>
                    <CalendarOff className="inline ml-2 mr-1 w-5 h-5" />
                    <span>
                      {auctionItem.endAt
                        ? formatDate(auctionItem.endAt)
                        : "Fecha no disponible"}
                    </span>
                  </div>

                  <div>
                    <MapPin className="inline mr-1 w-5 h-5" />
                    <span className="text-white text-sm">
                      {auctionItem.direction.street}{" "}
                      {auctionItem.direction.streetNumber} esq.{" "}
                      {auctionItem.direction.corner} -{" "}
                      {auctionItem.direction.department}
                    </span>
                  </div>
                  <div className="mt-3 flex">
                    <Link
                      to={url}
                      className="bg-transparent text-white font-semibold py-2 px-6 border-2 rounded-full hover:bg-white hover:text-[#0D4F61] hover:border-white transition-all duration-300"
                    >
                      Ver Subasta
                    </Link>
                  </div>
                </div>

                {/* Contenedor que ocupa el 100% del ancho y desde lo más arriba posible */}
                <div className="w-full flex">
                  {auctionItem.lots.slice(0, 3).map((lot, index) => (
                    <div key={index} className="w-1/3 h-full">
                      {/* Imagen estática de cada lote */}
                      <img
                        src={lot.imageUrl} // Imagen estática utilizada para todos los lotes
                        alt={`Lote ${index + 1}`}
                        className="w-full h-full object-cover" // Asegura que la imagen cubra todo el espacio sin deformarse
                      />
                    </div>
                  ))}
                </div>
              </div>
            </SplideSlide>
          );
        })}
      </Splide>
    </div>
  );
}
