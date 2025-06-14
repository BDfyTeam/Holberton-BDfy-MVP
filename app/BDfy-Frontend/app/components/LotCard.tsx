import { useState } from "react";
import type { Lot } from "../services/types";

interface LotCardProps {
  lot: Lot;
}

export default function LotCard({ lot }: LotCardProps) {
  const [bid, setBid] = useState<number>(lot.currentPrice || lot.startingPrice);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      setMessage("✅ Puja realizada con éxito");
    } catch (err: any) {
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
          onChange={(e) => setBid(Number(e.target.value))}
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
