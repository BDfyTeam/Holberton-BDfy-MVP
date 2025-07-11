import pengu from "app/public/assets/ConfusedPengu.png";
import { useEffect, useRef, useState } from "react";
import type { Auction } from "~/services/types";
import categorys from "~/services/categorys";
import { useInterval } from "~/services/hooks";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import { formatTime } from "~/services/formats";
import { Link } from "react-router";
import { AlarmClock, MapPin } from "lucide-react";

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

export default function HotCarusel({ auction, className, options }: Props) {
  const splideRef = useRef<any>(null); // Referencia para Splide
  const [time, setTime] = useState<number[]>([]);

  useInterval(() => {
    setTime((prevTimes) =>
      prevTimes.map((time) => (time > 0 ? time - 1000 : 0))
    );
  }, 1000);

  useEffect(() => {
    if (splideRef.current) {
      splideRef.current.refresh();
    }

    const remainingTimes = auction.map((auctionItem) => {
      const endDate = auctionItem.endAt ? new Date(auctionItem.endAt).getTime() : 0;
      const currentDate = new Date().getTime();
      return Math.max(endDate - currentDate, 0);
    });

    setTime(remainingTimes);
  }, [auction]);

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
    <div
      className={className}
      style={{
        background:
          "radial-gradient(circle, rgba(39, 119, 145, 1) 13%, rgba(13, 79, 97, 1) 58%, rgba(6, 44, 56, 1) 100%)",
      }}
    >
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-[#D3E3EB] mb-15">
        ULTIMA OPORTUNIDAD
      </h2>
      <Splide
        options={{
          type: "loop",
          perPage: 2,
          arrows: true,
          gap: "2rem",
          speed: 1500,
          ...options,
        }}
        className="mx-auto max-w-screen-2xl"
      >
        {auction.map((auctionItem, index) => {
          const url = `/auction/specific/${auctionItem.id}`;
          const remainingTime = time[index] || 0;
          return (
            <SplideSlide key={auctionItem.id}>
              <Link to={url}>
                <div className="flex w-full h-[400px] bg-[#0D4F61] rounded-2xl shadow-xl overflow-hidden border-4 border-[#D3E3EB] ">
                  {/* 50% Imagen de la subasta */}
                  <div className="w-3/7">
                    <img
                      src={auctionItem.imageUrl}
                      alt="Logo Subasta"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 50% Información de la subasta */}
                  <div className="w-1/2 p-4 text-white relative">
                    {/* Título */}
                    <h3 className="text-2xl font-semibold mb-5">
                      {auctionItem.title}
                    </h3>

                    {/* Descripción */}
                    <p className="text-sm mb-18 text-justify">
                      {auctionItem.description}
                    </p>

                    {/* Categorías */}
                    <div className="flex flex-wrap gap-2 mb-7">
                      {auctionItem.category.map((catId, index) => {
                        const category = categorys.find((c) => c.id === catId);
                        return (
                          <span
                            key={index}
                            className="bg-[#D3E3EB]/20 text-[#D3E3EB] text-xs font-medium px-3 py-1 rounded-full border border-[#D3E3EB]/40"
                          >
                            {category ? (
                              <span className="w-5 h-5">{category.icon}</span>
                            ) : (
                              `Categoría ${catId}`
                            )}
                          </span>
                        );
                      })}
                    </div>

                    {/* Dirección */}
                    <div className="flex items-center space-x-2 text-xs mb-4">
                      <MapPin className="w-4 h-4 text-[#D3E3EB]" />
                      <span>
                        {auctionItem.direction.street}{" "}
                        {auctionItem.direction.streetNumber}, esq.{" "}
                        {auctionItem.direction.corner} -{" "}
                        {auctionItem.direction.department}
                      </span>
                    </div>

                    {/* Contador */}
                    <div className="absolute bottom-2 w-full text-center">
                      <div className="flex justify-center gap-6 text-[#D3E3EB]">
                        <div className="flex flex-col items-center">
                          <span className="text-6xl">
                            {formatTime(remainingTime).split(":")[0]}
                          </span>
                          <span className="text-sm">DIAS</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-6xl">
                            {formatTime(remainingTime).split(":")[1]}
                          </span>
                          <span className="text-sm">HORAS</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-6xl">
                            {formatTime(remainingTime).split(":")[2]}
                          </span>
                          <span className="text-sm">MINUTOS</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-6xl">
                            {formatTime(remainingTime).split(":")[3]}
                          </span>
                          <span className="text-sm">SEGUNDOS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </SplideSlide>
          );
        })}
      </Splide>
    </div>
  );
}
