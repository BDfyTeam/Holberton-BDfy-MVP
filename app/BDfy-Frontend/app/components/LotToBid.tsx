import { useState, useEffect } from "react";
import type { Lot } from "../services/types";
import { makeAutoBid, makeBid } from "~/services/fetchService";

interface LotCardProps {
  lot: Lot;
  onBidInitiated: (lotId: string) => void;
  className?: string;
}

export default function LotToBid({ lot, onBidInitiated, className }: LotCardProps) {
  const [bid, setBid] = useState<number>((lot.currentPrice ?? lot.startingPrice) + 1);
  const [message, setMessage] = useState("");
  const [base, setBase] = useState(lot.currentPrice ?? lot.startingPrice);
  const [autoMaxBid, setAutoMaxBid] = useState<number | undefined>(undefined);


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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    
    const currentPrice = lot.currentPrice ?? lot.startingPrice;
    if (bid <= currentPrice) {
      setMessage(
        `❌ La puja debe ser mayor que el precio actual (${currentPrice}).`
      );
      return;
    }

    // onBidInitiated(lot.id);

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
      setMessage("❌ La autopuja debe tener un valor máximo mayor al actual e incremento positivo.");
      return;
    }
  
    try {
      const msg = await makeAutoBid(lot.id, autoMaxBid, minIncrement);
      setMessage(msg);
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div className={className}>
      <p className="font-semibold text-lg">{lot.description}</p>
      <p className="text-sm text-gray-600">{lot.details}</p>
      <p className="text-blue-700">
        Precio actual: {lot.currentPrice ?? lot.startingPrice}
      </p>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="space-y-2">
          <div className="flex gap-2">
            {botones.map((boton, idx) => (
              <button
                key={idx}
                type="submit"
                onClick={() => {
                  setBase(boton.finalValue);
                  setBid(boton.finalValue);
                  setMessage("");
                }}
                className="px-3 py-1 bg-cyan-800 rounded"
              >
                {boton.label}
              </button>
            ))}
          </div>
          <div>
            <input
              type="text"
              placeholder="Oferta personalizada"
              value={bid === 0 ? "" : bid.toString()}
              onChange={(e) => {
                const parsed = parseInt(e.target.value);
                if (!isNaN(parsed)) {
                  setBid(parsed);
                } else {
                  setBid(0); // opcional: podés usar `undefined` o no hacer nada si querés ignorar texto inválido
                }
                setMessage("");
              }}
              className="w-full border border-gray-300 rounded p-1"
            />
          </div>
          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold mb-2 text-sm">Autopuja</h3>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="text"
                placeholder="Puja máxima"
                className="border p-1 rounded"
                onChange={(e) => setAutoMaxBid(parseInt(e.target.value))}
              />
            </div>
            <button
              type="button"
              className="bg-green-600 text-white px-3 py-1 rounded"
              onClick={handleAutoBid}
            >
              Activar Autopuja
            </button>
          </div>
        </div>
        {message && <p className="text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  );
}
