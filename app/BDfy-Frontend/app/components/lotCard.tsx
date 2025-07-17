import { CheckCircle2} from "lucide-react";
import type { CompleteLot } from "~/services/types";
import categorys from "~/services/categorys";
import { use, useEffect, useState } from "react";
import { getUserById } from "~/services/fetchService";
import type { Winner } from "~/services/types";

type Props = { 
  lot: CompleteLot;
  onCardClick?: (item: CompleteLot) => void;
  className?: string 
};


export default function LotCard({ lot, className, onCardClick }: Props) {
const [winner, setWinner] = useState<Winner | null>(null);

useEffect(() => {
  const fetchWinner = async () => {
    if (lot.winnerId !== "00000000-0000-0000-0000-000000000000") {
      try {
        const user = await getUserById(lot.winnerId as string);
        setWinner({
          firstName: user.firstName,
          lastName: user.lastName,
          id: user.id
        });
      } catch (error) {
        console.error("Error fetching winner:", error);
      }
    }
  };
  fetchWinner();
}, [lot.winnerId]);

  return (
    <div className={className ?? "w-fit"}>
      <button onClick={onCardClick ? () => onCardClick(lot) : undefined}>
        <div
          className="relative w-[350px] h-[420px] rounded-2xl overflow-hidden text-white transform hover:scale-105 transition duration-300 my-8 shadow-lg border border-white"
        >
          {/* Imagen de fondo */}
          <img
            src={typeof lot.imageUrl === "string" ? lot.imageUrl : undefined}
            alt="Imagen del lote"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          {/* Contraste para que sea mas legible la card */}
          <div className="absolute inset-0 bg-black/50 z-0" />

          {/* Contenido por encima de la imagen */}
          <div className="relative z-10 p-6 flex flex-col justify-between h-full">

          {/* Título y detalles */}
          <div>
            <h3 className="text-xl font-bold mb-2">{lot.title}</h3>
            {lot.details && (
              <p className="text-xs italic opacity-90 mb-4">{lot.details}</p>
            )}
          </div>

          {/* --- CATEGORIAS Y ESTADO JUNTOS --- */}
          <div>
            {/* Categorías */}
            <div className="flex flex-wrap gap-2 mb-2">
              {lot.auction.category.map((id) => {
                const cat = categorys.find((c) => c.id === id);
                return (
                  <span
                    key={id}
                    className="flex items-center justify-center border border-white p-2 rounded-full text-xs"
                  >
                    {cat?.icon}
                  </span>
                );
              })}
            </div>

            {/* Estado */}
            {lot.sold ? (
              <>
                <span className="flex items-center gap-1 text-yellow-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-yellow-300" />
                <p className="text-sm">Vendido a: {winner?.firstName} {winner?.lastName}</p>
                </span>

              </>
            ) : (
              <span className="text-yellow-300 text-sm">Disponible</span>
            )}
          </div>
        </div>
        </div>
      </button>
    </div>
  );
}
