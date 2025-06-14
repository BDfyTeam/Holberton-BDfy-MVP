import { useState, useEffect } from "react";
import type { Lot } from "../services/types";

interface LotCardProps {
  lot: Lot;
  // Nueva prop: un callback para notificar cuando se inicia una puja en este lote
  onBidInitiated: (lotId: string) => void; 
}

export default function LotCard({ lot, onBidInitiated }: LotCardProps) {
  const [bid, setBid] = useState<number>((lot.currentPrice ?? lot.startingPrice) + 1);
  const [message, setMessage] = useState("");

  // Este useEffect asegura que el input de la puja se actualice
  // cuando el precio del lote cambie (debido a actualizaciones de SignalR).
  useEffect(() => {
    const newMinimumBid = (lot.currentPrice ?? lot.startingPrice) + 1;
    setBid(newMinimumBid);
    setMessage(""); // Limpiamos cualquier mensaje anterior
  }, [lot.currentPrice, lot.startingPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentPrice = lot.currentPrice ?? lot.startingPrice;
    if (bid <= currentPrice) {
      setMessage(`❌ La puja debe ser mayor que el precio actual (${currentPrice}).`);
      return;
    }

    // Notificar al componente padre que se ha iniciado una puja en este lote.
    // Esto se hace ANTES de enviar la puja, para que el padre pueda gestionar la suscripción.
    onBidInitiated(lot.id); 

    try {
      const dateNow = new Date();
      const response = await fetch(`http://127.0.0.1:5016/api/1.0/lots/bid/${lot.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          amount: bid,
          time: dateNow,
          lotId: lot.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error desconocido al realizar la puja.");
      }

      setMessage("✅ Puja realizada con éxito");

    } catch (err: any) {
      console.error("Error al enviar la puja:", err);
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div className="bg-white text-black p-4 rounded-lg shadow space-y-2">
      <p className="font-semibold text-lg">{lot.description}</p>
      <p className="text-sm text-gray-600">{lot.details}</p>
      <p className="text-blue-700">Precio actual: {lot.currentPrice ?? lot.startingPrice}</p>

      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="number"
          min={(lot.currentPrice ?? lot.startingPrice) + 1}
          value={bid}
          onChange={(e) => {
            setBid(Number(e.target.value));
            setMessage("");
          }}
          className="w-full border border-gray-300 rounded p-1"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-1 rounded hover:bg-blue-700 transition"
        >
          Pujar
        </button>
        {message && <p className="text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  );
}
