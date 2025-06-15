import { useParams } from "react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { getAuctionById } from "~/services/fetchService";
import type { Auction } from "~/services/types";
import LotCard from "~/components/LotCard";
import * as signalR from "@microsoft/signalr";

export default function AuctionPage() {
  const { id } = useParams();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<string>("Disconnected");
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  // Nuevo estado para rastrear el ID del lote al que estamos escuchando activamente
  const [activeListeningLotId, setActiveListeningLotId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const data = await getAuctionById(String(id));
        console.log("Datos de la subasta recibidos:", data);
        setAuction(data);
        // Opcional: Si quieres que por defecto se escuche el primer lote al cargar la subasta
        if (data.lots && data.lots.length > 0) {
          setActiveListeningLotId(data.lots[0].id);
        }
      } catch (err) {
        console.error("Error al cargar la subasta:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAuction();
  }, [id]);

  const handleBidUpdate = useCallback((bidUpdate: { LotId: string; CurrentPrice: number; BuyerId: string; Timestamp: string }) => {
    console.log("Nueva puja recibida (PascalCase):", bidUpdate);
    setAuction((prev) => {
      if (!prev) {
        console.log("No hay auction para actualizar");
        return prev;
      }
      
      console.log("Actualizando auction con nueva puja (PascalCase):", bidUpdate);
      const updatedLots = prev.lots.map((lot) => {
        if (lot.id === bidUpdate.LotId) {
          console.log(`Actualizando lote ${lot.id}: ${lot.currentPrice} -> ${bidUpdate.CurrentPrice}`);
          return { ...lot, currentPrice: bidUpdate.CurrentPrice };
        }
        return lot;
      });
      
      return { ...prev, lots: updatedLots };
    });
  }, []);

  const handleMessage = useCallback((type: string, message: string) => {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }, []);

  // Función para unirse a un grupo específico
  const joinSpecificAuctionGroup = useCallback(async (connection: signalR.HubConnection, lotIdToJoin: string) => {
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      console.warn("No hay conexión SignalR para unirse al grupo.");
      return;
    }
    try {
      await connection.invoke("JoinAuctionGroup", lotIdToJoin);
      console.log("Unido a grupo del lote", lotIdToJoin);
    } catch (err) {
      console.error("Error al unirse al grupo del lote:", lotIdToJoin, err);
    }
  }, []);

  // Función para abandonar un grupo específico
  const leaveSpecificAuctionGroup = useCallback(async (connection: signalR.HubConnection, lotIdToLeave: string) => {
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      console.warn("No hay conexión SignalR para abandonar el grupo.");
      return;
    }
    try {
      await connection.invoke("LeaveAuctionGroup", lotIdToLeave);
      console.log("Te fuiste del grupo del lote", lotIdToLeave);
    } catch (err) {
      console.error("Error al irse del grupo del lote:", lotIdToLeave, err);
    }
  }, []);

  // Nuevo handler para cuando una puja es iniciada en un LotCard
  const handleBidInitiated = useCallback(async (lotId: string) => {
    const connection = connectionRef.current;
    if (!connection) {
      console.warn("Conexión SignalR no disponible al iniciar puja.");
      return;
    }

    if (activeListeningLotId && activeListeningLotId !== lotId) {
      // Si ya estamos escuchando un lote diferente, lo abandonamos
      await leaveSpecificAuctionGroup(connection, activeListeningLotId);
    }
    
    // Nos unimos al nuevo lote (si no estamos ya unidos)
    if (activeListeningLotId !== lotId) { // Evitar unirse si ya estamos en ese grupo
        await joinSpecificAuctionGroup(connection, lotId);
    }
    setActiveListeningLotId(lotId); // Actualizamos el lote activo de escucha
    console.log(`Cambiando escucha activa a lote: ${lotId}`);
  }, [activeListeningLotId, joinSpecificAuctionGroup, leaveSpecificAuctionGroup]);


  useEffect(() => {
    if (!auction) return; // Esperar a que la subasta se cargue

    let isMounted = true;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5015/BidHub", {
        accessTokenFactory: () => localStorage.getItem("token") || "",
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: false,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => { // Ping al cliente
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          return 30000;
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    // Configurar event handlers
    connection.on("ReceiveBid", handleBidUpdate);
    connection.on("ReceiveMessage", handleMessage);

    connection.onclose((error) => {
      if (isMounted) {
        console.error("Conexión cerrada:", error);
        setConnectionStatus("Disconnected");
      }
    });

    connection.onreconnecting((error) => {
      if (isMounted) {
        console.warn("Reconectando a SignalR:", error);
        setConnectionStatus("Reconnecting");
      }
    });

    connection.onreconnected(async (connectionId) => {
      if (isMounted) {
        console.log("Reconectado con ID:", connectionId);
        setConnectionStatus("Connected");
        // Al reconectar, unirse al lote activo actual si existe
        if (activeListeningLotId) {
          await joinSpecificAuctionGroup(connection, activeListeningLotId);
        }
      }
    });

    const startConnection = async () => {
      try {
        if (!isMounted) return;
        
        await connection.start();
        
        if (!isMounted) return;
        
        console.log("Conectado a SignalR");
        setConnectionStatus("Connected");
        // Si hay un lote activo al iniciar la conexión, unirse a su grupo
        if (activeListeningLotId) {
          await joinSpecificAuctionGroup(connection, activeListeningLotId);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Fallo al conectar con SignalR:", err);
          setConnectionStatus("Failed");
        }
      }
    };

    startConnection();

    // Cleanup: Se ejecuta cuando el componente se desmonta o las dependencias cambian
    return () => {
      isMounted = false;
      console.log("Limpiando conexión SignalR y saliendo de grupos...");
      const currentConnection = connectionRef.current;
      // Al desmontar, abandonar el lote que se estaba escuchando activamente
      if (currentConnection && currentConnection.state === signalR.HubConnectionState.Connected && activeListeningLotId) {
        leaveSpecificAuctionGroup(currentConnection, activeListeningLotId).catch(console.error);
      }
      if (currentConnection) {
        currentConnection.stop().catch(console.error);
      }
      connectionRef.current = null;
    };
  }, [auction?.id, activeListeningLotId]); // Depende de activeListeningLotId para reconfigurar suscripciones

  if (loading) return <p className="text-center text-white">Cargando subasta...</p>;
  if (!auction) return <p className="text-center text-red-500">Subasta no encontrada.</p>;

  return (
    <div className="p-6 text-white">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{auction.title}</h1>
          <p className="text-gray-300">{auction.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {auction.lots.map((lot) => (
          <LotCard 
            key={lot.id} 
            lot={lot} 
            onBidInitiated={handleBidInitiated} // Pasamos el nuevo callback
          />
        ))}
      </div>
    </div>
  );
}
