import { useState, useEffect } from "react";
import type { CompleteLot, Lot, RegisterUser } from "../services/types";
import {
  getLotById,
  getUserById,
  makeAutoBid,
  makeBid,
} from "~/services/fetchService";
import { getUserIdFromToken } from "~/services/handleToken";

type BiddingHistoryDto = {
  User: {
    FirstName: string;
    LastName: string;
  };
  Amount: number;
  Time: string;
  IsAutoBid: boolean;
};

interface LotCardProps {
  lot: CompleteLot;
  onBidInitiated: (lotId: string) => void;
  className?: string;
  history?: BiddingHistoryDto[];
}

export default function LotToBid({
  lot,
  onBidInitiated,
  className,
  history,
}: LotCardProps) {
  const [bid, setBid] = useState<number>(
    (lot.currentPrice ?? lot.startingPrice) + 1
  );
  const [customBidInput, setCustomBidInput] = useState("");
  const [message, setMessage] = useState("");
  const [base, setBase] = useState(lot.currentPrice ?? lot.startingPrice);
  const [autoMaxBid, setAutoMaxBid] = useState<number | undefined>(undefined);
  const [autoBidConfirmed, setAutoBidConfirmed] = useState(false);
  const [holdingIndex, setHoldingIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const holdTime = 1500;
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [winner, setWinner] = useState<RegisterUser | null>(null);

  // Este useEffect asegura que el input de la puja se actualice
  // cuando el precio del lote cambie (debido a actualizaciones de SignalR).
  useEffect(() => {
    const newMinimumBid = (lot.currentPrice ?? lot.startingPrice) + 1;
    setBid(newMinimumBid);
    setMessage(""); // Limpiamos cualquier mensaje anterior
  }, [lot.currentPrice, lot.startingPrice]);

  useEffect(() => {
    setBase(lot.currentPrice ?? lot.startingPrice);
    setBid((lot.currentPrice ?? lot.startingPrice) + 1);
  }, [lot.id, lot.currentPrice]);

  useEffect(() => {
    const checkIfOwner = async () => {
      const userId = getUserIdFromToken();
      const lotWithAuctioneer = await getLotById(lot.id);
      if (userId === lotWithAuctioneer.auction.auctioneer.userId) {
        setIsOwner(true);
      }
    };
    const getWinner = async () => {
      if (
        lot.winnerId !== "00000000-0000-0000-0000-000000000000" &&
        lot.winnerId
      ) {
        const winnerData = await getUserById(lot.winnerId);
        setWinner(winnerData);
      }
    };

    getWinner();
    checkIfOwner();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentPrice = lot.currentPrice ?? lot.startingPrice;
    if (bid <= currentPrice) {
      setMessage(`❌ La puja debe ser mayor que $(${currentPrice}).`);
      return;
    }

    onBidInitiated(lot.id);

    const mesgg = makeBid(lot.id, bid);
    setMessage(await mesgg);
  };

  function rondTo50(n: number): number {
    return Math.round(n / 50) * 50;
  }

  const divisores = [10, 5, 2, 1.5];

  const botones = divisores.map((divisor) => {
    const incremento = rondTo50(base / divisor);
    return {
      label: `+${incremento}`,
      finalValue: base + incremento,
      incremento,
    };
  });

  const minIncrement = Math.min(...botones.map((b) => b.incremento));

  const handleAutoBid = async () => {
    if (autoMaxBid === undefined || autoMaxBid <= base) {
      setMessage(
        "❌ La autopuja debe tener un valor máximo mayor al actual e incremento positivo."
      );
      return;
    }

    try {
      const msg = await makeAutoBid(lot.id, autoMaxBid, minIncrement);
      setMessage(msg);
      setAutoBidConfirmed(true);
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    }
  };

  const winningEntry =
    history && history.length > 0
      ? history.reduce((max, current) =>
          current.Amount > max.Amount ? current : max
        )
      : null;

  return (
    <div className={className}>
      {/* informacion */}
      {/* Columna izquierda */}
      <div
        className="flex flex-col w-3/5 rounded-xl shadow-lg shadow-black/40 h-full justify-start"
        style={{
          background:
            "linear-gradient(135deg,rgba(13, 79, 97, 1) 27%, rgba(65, 196, 174, 1) 100%)",
        }}
      >
        <img
          src={
            lot.imageUrl instanceof File
              ? URL.createObjectURL(lot.imageUrl)
              : lot.imageUrl
          }
          alt={lot.title}
          className="p-4 w-full h-auto object-contain rounded-3xl mb-4"
        />
        <h3 className="text-2xl font-bold mb-5 text-white text-center">
          Lote N° {lot.lotNumber} - {lot.title}
        </h3>
        {/* subColumnas */}
        <div className="flex flex-col-2 gap-4 p-4 ml-6 text-white">
          <div className="justify-center text-center w-1/2">
            <p className="text-sm line-clamp-5 overflow-hidde">{lot.details}</p>
          </div>
          <div className="justify-end w-1/2 mr-6 flex flex-col">
            <div
              className="text-[#C43C1A] text-center leading-tight border-2 rounded-full 
                border-[#C43C1A] bg-[#C43C1A]/30 py-1 mb-4"
            >
              <span className="block">Precio actual</span>
              <span className="block text-2xl font-bold">
                ${base}
              </span>
            </div>
            <div className="text-[#C44157] text-center leading-tight py-1 mx-10">
              <span className="block">Precio base</span>
              <span className="block text-2xl font-bold">
                ${lot.startingPrice}
              </span>
            </div>
          </div>
        </div>
        <div className="w-3/4 h-0.5 mx-auto my-1 bg-white" />
        <p className="font-semibold text-lg text-white text-center my-5">
          {lot.description}
        </p>
      </div>

      {/* Historial y botones */}
      <div className="w-2/5 h-full my-3 overflow-visible">
        {/* Columna derecha */}
        {isOwner ? (
          <div className="h-1/2  flex flex-col justify-between">
            <div className="text-center text-[#0D4F61]">
              <h2 className="text-2xl font-bold mb-2">Panel del Subastador</h2>
              <p className="text-xs text-gray-600">
                Aquí podés monitorear la actividad de este lote en tiempo real.
              </p>
            </div>

            {/* Información del estado */}
            <div className="bg-[#D3E3EB] rounded-xl shadow-inner p-4 mt-1 space-y-3 text-[#0D4F61]">
              <div className="flex justify-between">
                <span className="font-semibold">Pujas recibidas:</span>
                <span className="font-bold text-lg">
                  {history?.length ? history?.length : "Sin ofertas aún"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Última oferta:</span>
                <span className="font-bold text-lg">
                  ${lot.currentPrice ? lot.currentPrice : "Sin ofertas aún"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Usuario lider:</span>
                <span className="font-medium">
                  {winningEntry
                    ? `${winningEntry.User.FirstName} ${winningEntry.User.LastName}`
                    : "Sin ofertas aún"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Estado:</span>
                {lot.winnerId === null ||
                lot.winnerId === "00000000-0000-0000-0000-000000000000" ? (
                  <span className="font-bold text-green-600">Activa</span>
                ) : (
                  <span className="font-bold text-[#0D4F61]">
                    {winner?.firstName} {winner?.lastName}
                  </span>
                )}
              </div>
            </div>

            {/* Botones de gestión visuales */}
            <div className="flex flex-col mt-1 gap-2">
              <button className="w-full bg-[#41c4ae] text-white py-2 rounded-full hover:bg-[#0D4F61] transition">
                Editar lote
              </button>
              <button className="w-full bg-[#C4B441] text-white py-2 rounded-full hover:bg-[#93831D] transition">
                Reiniciar puja
              </button>
              <button className="w-full bg-[#C44157] text-white py-2 rounded-full hover:bg-[#81071b] transition">
                Cerrar subasta
              </button>
            </div>
          </div>
        ) : (
          <div className="h-3/5">
            <h1 className="text center text-2xl font-bold mb-6 text-center">
              Gestionar ofertas
            </h1>
            {/* Botones y Autopuja */}
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="grid grid-cols-2 gap-4 mb-5">
                <p className="text-xs text-gray-500 col-span-2 text-center">
                  Mantenga precionado los botones para realizar su oferta.
                </p>
                {botones.map((boton, idx) => (
                  <button
                    key={idx}
                    type="submit"
                    onMouseDown={() => {
                      setHoldingIndex(idx);
                      let start = Date.now();
                      const interval = setInterval(() => {
                        const elapsed = Date.now() - start;
                        setProgress(Math.min((elapsed / holdTime) * 100, 100));
                        if (elapsed >= holdTime) {
                          clearInterval(interval);
                          setProgress(0);
                          setHoldingIndex(null);
                          setBase(boton.finalValue);
                          setBid(boton.finalValue);
                          setMessage("");
                        }
                      }, 50);

                      // Limpiar si suelta antes de tiempo
                      const cancel = () => {
                        clearInterval(interval);
                        setProgress(0);
                        setHoldingIndex(null);
                        window.removeEventListener("mouseup", cancel);
                        window.removeEventListener("mouseleave", cancel);
                      };

                      window.addEventListener("mouseup", cancel);
                      window.addEventListener("mouseleave", cancel);
                    }}
                    className={`py-3 rounded-full transition-all duration-300 relative overflow-hidden ${
                      holdingIndex === idx
                        ? "bg-[#2CA896]"
                        : "bg-[#41C4AE] hover:scale-105"
                    }`}
                  >
                    <span className="relative z-10">{boton.label}</span>
                    {holdingIndex === idx && (
                      <div
                        className="absolute inset-0 bg-[#0D4F61] opacity-30 z-0 origin-left transition-transform"
                        style={{
                          transform: `scaleX(${progress / 100})`,
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
              {/* Monto personalizado */}
              <div className="w-full">
                <div className="relative w-full flex items-end gap-2">
                  {/* Input flotante */}
                  <div className="relative w-full">
                    <input
                      type="text"
                      id="customBid"
                      placeholder=" "
                      onChange={(e) => setCustomBidInput(e.target.value)}
                      className="w-full py-2 px-5 bg-[#D3E3EB] border-2 rounded-full border-[#0D4F61] focus:outline-none 
                      focus:border-[#41c4ae] peer transition-all 
                      autofill:bg-[#D3E3EB] autofill:text-[#0D4F61] autofill:border-[#0D4F61]"
                    />
                    <label
                      htmlFor="customBid"
                      className="absolute left-3 top-2 text-[#0D4F61] text-lg transition-all 
                        peer-placeholder-shown:top-2 peer-placeholder-shown:text-[#8a8989] 
                        peer-focus:top-[-12px] peer-focus:text-[#41c4ae] peer-focus:text-xs 
                        peer-not-placeholder-shown:top-[-12px] peer-not-placeholder-shown:text-[#0D4F61] 
                        peer-not-placeholder-shown:text-xs peer-focus:bg-[#D3E3EB] peer-focus:p-1
                        peer-not-placeholder-shown:bg-[#D3E3EB] peer-not-placeholder-shown:p-1"
                    >
                      Personalizar oferta
                    </label>
                  </div>

                  {/* Botón a la derecha */}
                  <button
                    type="submit"
                    className="bg-[#41c4ae] text-white px-4 py-2 rounded-full h-fit hover:bg-[#0D4F61] transition"
                    onClick={() => {
                      const parsed = parseInt(customBidInput);
                      if (!isNaN(parsed)) {
                        setBid(parsed);
                        setMessage("✔️ Monto personalizado confirmado");
                      } else {
                        setMessage("❌ Ingrese un número válido");
                      }
                    }}
                  >
                    Confirmar
                  </button>
                </div>
                <p className="text-xs text-gray-500 col-span-2 text-center mt-4">
                  Ingrese el precio total que quiere ofertar, no unicamente el
                  valor a sumar.
                </p>
              </div>

              {/* Autopuja */}
              <div className="mt-6 w-full">
                {/* Input flotante para autopuja */}
                <div className="relative w-full mb-1">
                  <input
                    type="text"
                    id="autoBidInput"
                    placeholder=" "
                    onChange={(e) => setAutoMaxBid(parseInt(e.target.value))}
                    className="w-full py-2 px-5 bg-[#D3E3EB] border-2 rounded-full border-[#0D4F61] focus:outline-none 
                  focus:border-[#41c4ae] peer transition-all 
                  autofill:bg-[#D3E3EB] autofill:text-[#0D4F61] autofill:border-[#0D4F61]"
                  />
                  <label
                    htmlFor="autoBidInput"
                    className="absolute left-3 top-2 text-[#0D4F61] text-mb transition-all 
                    peer-placeholder-shown:top-2 peer-placeholder-shown:text-[#8a8989] 
                    peer-focus:top-[-12px] peer-focus:text-[#41c4ae] peer-focus:text-xs 
                    peer-not-placeholder-shown:top-[-12px] peer-not-placeholder-shown:text-[#0D4F61] 
                    peer-not-placeholder-shown:text-xs peer-focus:bg-[#D3E3EB] peer-focus:p-1
                    peer-not-placeholder-shown:bg-[#D3E3EB] peer-not-placeholder-shown:p-1"
                  >
                    Ingrese el monto máximo de autopuja
                  </label>
                </div>

                {/* Mensaje flotante con transición */}
                <div className="min-h-[1.5rem] transition-all duration-500 ease-in-out">
                  {autoBidConfirmed && (
                    <p className="text-sm text-[#0D4F61] text-center mb-3">
                      Autopuja hasta: ${autoMaxBid}
                    </p>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex justify-between gap-4">
                  <button
                    type="button"
                    className="w-full bg-[#41c4ae] text-white px-4 py-2 rounded-full hover:bg-[#0D4F61] transition"
                    onClick={handleAutoBid}
                  >
                    Confirmar
                  </button>

                  <button
                    type="button"
                    className="w-full bg-[#C44157] text-white px-4 py-2 rounded-full hover:bg-[#81071b] transition"
                    onClick={() => {
                      setAutoBidConfirmed(false);
                      setAutoMaxBid(undefined);
                      setMessage("⚠️ Autopuja desactivada");
                    }}
                  >
                    Deshacer
                  </button>
                </div>
              </div>

              {/* {message && <p className="text-sm text-gray-700">{message}</p>} */}
            </form>
          </div>
        )}

        {/* Historial */}
        <div className="relative h-full mt-6 overflow-hidden rounded-lg shadow-inner">
          <div className="h-auto overflow-hidden">
            {history && history.length > 0 && (
              <div className="absolute inset-0 overflow-y-auto rounded-lg bg-[#D3E3EB] px-4 py-3 mx-2 mt-2 shadow-lg">
                <h2 className="text-lg font-bold text-[#0D4F61] mb-2 text-center">
                  Historial de pujas
                </h2>
                <ul className="space-y-2">
                  {history.map((entry, index) => {
                    const isWinning =
                      entry.Amount ===
                      Math.max(...history.map((h) => h.Amount));

                    return (
                      <li
                        key={index}
                        className={`rounded-lg px-4 py-2 shadow-sm border 
                        ${
                          isWinning
                            ? "bg-[#41c4ae]/80 border-[#41c4ae]/80 text-white font-semibold text-md"
                            : "bg-white border-gray-300 text-[#0D4F61]"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>
                            {entry.User.FirstName} {entry.User.LastName}
                          </span>
                          <span
                            className={isWinning ? "text-lg font-bold" : ""}
                          >
                            ${entry.Amount}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 text-right italic">
                          {new Date(entry.Time).toLocaleTimeString()}{" "}
                          {entry.IsAutoBid && (
                            <span className="ml-1">(Auto)</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
