import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { getAuctionById } from "~/services/fetchService";
import type { Auction } from "~/services/types";
import LotCard from "~/components/LotCard";
import * as signalR from "@microsoft/signalr";

export default function AuctionPage() {
  const { id } = useParams();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchAuction = async () => {
    try {
      const data = await getAuctionById(String(id));
      console.log("Datos de la subasta recibidos:", data);
      setAuction(data);
    } catch (err) {
      console.error("Error al cargar la subasta:", err);
    } finally {
      setLoading(false);
    }
  };

  if (id) fetchAuction();
}, [id]);


useEffect(() => {
  if (!auction) return;

  const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5015/BidHub", {
      accessTokenFactory: () => localStorage.getItem("token") || "",
    })
    .withAutomaticReconnect()
    .build();

connection.start()
  .then(async () => {
    console.log("Conectado a SignalR");
    for (const lot of auction.lots) {
      try {
        await connection.invoke("JoinAuctionGroup", lot.id);
        console.log("Unido a grupo del lote", lot.id);
      } catch (err) {
        console.error("Error al unirse al grupo del lote:", lot.id, err);
      }
    }
  })
  .catch(err => {
    console.error("Fallo al conectar con SignalR:", err);
  });

  connection.on("ReceiveBid", (bidUpdate: { lotId: string; currentPrice: number; buyerId: string}) => {
    console.log("Nueva puja recibida:", bidUpdate);
    setAuction((prev) => {
      if (!prev) return prev;
      const updatedLots = prev.lots.map((lot) =>
        lot.id === bidUpdate.lotId
          ? { ...lot, currentPrice: bidUpdate.currentPrice }
          : lot
      );
      return { ...prev, lots: updatedLots };
    });
  });

connection.on("ReceiveMessage", (type: string, message: string) => {
  console.log(`[${type.toUpperCase()}] ${message}`);
});

connection.onclose((error) => {
  console.error("Conexión cerrada:", error);
});

connection.onreconnecting((error) => {
  console.warn("Reconectando a SignalR:", error);
});

connection.onreconnected((connectionId) => {
  console.log("Reconectado con ID:", connectionId);
});

  return () => {
    connection.stop();
  };
}, [auction]);


  if (loading) return <p className="text-center text-white">Cargando subasta...</p>;
  if (!auction) return <p className="text-center text-red-500">Subasta no encontrada.</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-2">{auction.title}</h1>
      <p className="text-gray-300 mb-6">{auction.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {auction.lots.map((lot) => (
          <LotCard key={lot.id} lot={lot} />
        ))}
      </div>
    </div>
  );
}