import { useParams } from "react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { getAuctionById, getLotById, getUserById } from "~/services/fetchService";
import {
  type Auctioneer,
  type Auction,
  type BasicCardItem,
  type Lot,
} from "~/services/types";
import LotToBid from "~/components/LotToBid";
import * as signalR from "@microsoft/signalr";
import { getToken } from "~/services/handleToken";
import GaleryOfCards from "~/components/galeryOfLotCards";
import categorys from "~/services/categorys";
import {
  CalendarIcon,
  CalendarOffIcon,
  IdCard,
  LayoutList,
  MailIcon,
  MapPinIcon,
  SmartphoneIcon,
  VerifiedIcon,
} from "lucide-react";
import { formatDate } from "~/services/formats";
import gatoCoca from "~/public/assets/gaatoCoca.jpg";
import Galerys from "~/components/Galerys";

type BidUpdate = {
  LotId: string;
  CurrentPrice: number;
  BuyerId: string;
  Timestamp: string;
};

type BiddingHistoryDto = {
  User: {
    FirstName: string;
    LastName: string;
  };
  Amount: number;
  Time: string;
  IsAutoBid: boolean;
};

export default function AuctionPage() {
  const { id } = useParams();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Disconnected");
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  // Nuevo estado para rastrear el ID del lote al que estamos escuchando activamente
  const [activeListeningLotId, setActiveListeningLotId] = useState<
    string | null
  >(null);
  const [selectLot, setselectLot] = useState<Lot | null>(null);
  const [biddingHistories, setBiddingHistories] = useState<
    Record<string, BiddingHistoryDto[]>
  >({});
  const [auctioneer, setAuctioneer] = useState<Auctioneer | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);

  useEffect(() => {
    if (selectLot) {
      suscribirseAlLote(selectLot.id);
    }
  }, [selectLot]);

  useEffect(() => {
    const fetchAuctionAndUser = async () => {
      try {
        const data = await getAuctionById(String(id));
        setAuction(data);
        const user = await getUserById(data.auctioneer.userId);
        setAuctioneer({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password,
          ci: user.ci,
          reputation: user.reputation,
          phone: user.phone,
          role: user.role,
          imageUrl: user.imageUrl,
          direction: {
            street: user.direction.street,
            streetNumber: user.direction.streetNumber,
            corner: user.direction.corner,
            zipCode: user.direction.zipCode,
            department: user.direction.department,
          },
          id: user.id,
          auctionHouse: user.auctioneerDetails.auctionHouse,
          plate: user.auctioneerDetails.plate
        });
        setLots(data.lots);

        if (data.lots && data.lots.length > 0) {
          setActiveListeningLotId(data.lots[0].id);
        }
      } catch (err) {
        console.error("Error al cargar la subasta:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAuctionAndUser();
  }, [id]);

  const handleBidUpdate = useCallback((bidUpdate: BidUpdate) => {
    setAuction((prev) => {
      if (!prev) {
        return prev;
      }

      const updatedLots = prev.lots.map((lot) => {
        if (lot.id === bidUpdate.LotId) {
          return { ...lot, currentPrice: bidUpdate.CurrentPrice };
        }
        return lot;
      });

      return { ...prev, lots: updatedLots };
    });
  }, []);

  const handleBiddingHistory = useCallback(
    (history: BiddingHistoryDto[]) => {
      if (!activeListeningLotId) return;
      setBiddingHistories((prev) => ({
        ...prev,
        [activeListeningLotId]: history,
      }));
    },
    [activeListeningLotId]
  );

  useEffect(() => {
    if (!auction || !selectLot) return;

    const updatedLot = auction.lots.find((l) => l.id === selectLot.id);
    if (updatedLot) {
      setselectLot(updatedLot);
    }
  }, [auction, selectLot?.id]);

  const handleMessage = useCallback((type: string, message: string) => {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }, []);

  // Función para unirse a un grupo específico
  const joinSpecificAuctionGroup = useCallback(
    async (connection: signalR.HubConnection, lotIdToJoin: string) => {
      if (
        !connection ||
        connection.state !== signalR.HubConnectionState.Connected
      ) {
        console.warn("No hay conexión SignalR para unirse al grupo.");
        return;
      }
      try {
        await connection.invoke("JoinAuctionGroup", lotIdToJoin);
        console.log("Unido a grupo del lote", lotIdToJoin);
      } catch (err) {
        console.error("Error al unirse al grupo del lote:", lotIdToJoin, err);
      }
    },
    []
  );

  // Función para abandonar un grupo específico
  const leaveSpecificAuctionGroup = useCallback(
    async (connection: signalR.HubConnection, lotIdToLeave: string) => {
      if (
        !connection ||
        connection.state !== signalR.HubConnectionState.Connected
      ) {
        console.warn("No hay conexión SignalR para abandonar el grupo.");
        return;
      }
      try {
        await connection.invoke("LeaveAuctionGroup", lotIdToLeave);
      } catch (err) {
        console.error("Error al irse del grupo del lote:", lotIdToLeave, err);
      }
    },
    []
  );

  // Nuevo handler para cuando una puja es iniciada en un LotCard
  const suscribirseAlLote = useCallback(
    async (lotId: string) => {
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
      if (activeListeningLotId !== lotId) {
        // Evitar unirse si ya estamos en ese grupo
        await joinSpecificAuctionGroup(connection, lotId);
      }
      setActiveListeningLotId(lotId); // Actualizamos el lote activo de escucha
    },
    [activeListeningLotId, joinSpecificAuctionGroup, leaveSpecificAuctionGroup]
  );

  useEffect(() => {
    if (!auction) return; // Esperar a que la subasta se cargue

    let isMounted = true;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://api.bdfy.tech/BidHub", {
        accessTokenFactory: () => getToken() || "",
        skipNegotiation: false,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Ping al cliente
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          return 30000;
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    // Configurar event handlers
    connection.on("ReceiveBid", handleBidUpdate);
    connection.on("ReceiveMessage", handleMessage);
    connection.on("ReceiveBiddingHistory", handleBiddingHistory);

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
      const currentConnection = connectionRef.current;
      // Al desmontar, abandonar el lote que se estaba escuchando activamente
      if (
        currentConnection &&
        currentConnection.state === signalR.HubConnectionState.Connected &&
        activeListeningLotId
      ) {
        leaveSpecificAuctionGroup(
          currentConnection,
          activeListeningLotId
        ).catch(console.error);
      }
      if (currentConnection) {
        currentConnection.stop().catch(console.error);
      }
      connectionRef.current = null;
    };
  }, [auction?.id, activeListeningLotId]); // Depende de activeListeningLotId para reconfigurar suscripciones

  if (loading)
    return <p className="text-center text-white">Cargando subasta...</p>;
  if (!auction)
    return <p className="text-center text-red-500">Subasta no encontrada.</p>;

  const items = auction.lots.map((lot) => ({
    id: lot.id,
    title: `Lote #${lot.lotNumber}`,
    description: lot.description,
    // category: lot.category
  }));

  const handleCardClick = (item: BasicCardItem) => { // item ya no deberia ser un BasicCardItem, sino un CompleteLot, para poder recibir toda la info
    const lote = auction?.lots.find((l) => l.id === item.id);
    if (lote) setselectLot(lote);
  };

  const history = selectLot ? biddingHistories[selectLot.id] || [] : [];
  

  return (
    // INFORMACION DE LA SUBASTA
    <div className="items-center text-white">
      <div className="flex justify-center items-start">
        {/* Zona principal: 3/4 de la pantalla */}
        <div 
          className="w-3/4 p-4 flex mt-[100px] mb-10 bg-[#0D4F61] rounded-lg shadow-gray-700 shadow-2xl"
          style={{
            background:
              "linear-gradient(135deg,rgba(13, 79, 97, 1) 27%, rgba(65, 196, 174, 1) 100%)",
          }}  
        >
          {/* Información de la subasta (2/4) */}
          <div className="w-3/4 pr-8">
            {/* Titulo */}
            <h1 className="text-5xl font-bold text-white text-center my-[2vw]">
              {auction.title.toUpperCase()}
            </h1>

            {/* Imagen de la casa de subasta y descripción */}
            <div className="flex justify-between items-start mt-6">
              {/* Columna izquierda: Imagen y nombre de la casa de subastas */}
              <div className="w-2/4 mr-25 ml-40 flex flex-col items-center">
                <img
                  src={auction.imageUrl}
                  alt={auction.title}
                  className="max-w-[90%] h-auto rounded-2xl mb-4"
                />
                <p className="text-white mb-2 text-center">
                  {auctioneer?.auctionHouse}
                </p>
              </div>

              {/* Columna derecha: Información de la subasta */}
              <div className="w-3/4 flex flex-col">
                {/* Categorías */}
                <div className="flex flex-wrap gap-2 my-5">
                  {auction.category.map((catId, index) => {
                    // Encontrar la categoría por su id
                    const category = categorys.find((c) => c.id === catId);
                    return (
                      <span
                        key={index}
                        className="bg-white/20 text-white text-xm font-medium px-3 py-1 rounded-full border border-white/40"
                      >
                        {category ? category.name : `Categoría ${catId}`}
                      </span>
                    );
                  })}
                </div>

                {/* Número de lotes */}
                <p className="flex items-center mb-4 text-xl">
                  <LayoutList className="w-7 h-7 text-white mr-2" />
                  N° de lotes: {auction.lots.length}
                </p>

                {/* Fecha de inicio */}
                <p className="flex items-center mb-4 text-xl">
                  <CalendarIcon className="w-7 h-7 text-white mr-2" />
                  {formatDate(auction.startAt)}
                </p>

                {/* Fecha de fin */}
                <p className="flex items-center mb-4 text-xl">
                  <CalendarOffIcon className="w-7 h-7 text-white mr-2" />
                  {formatDate(
                    auction.endAt ? auction.endAt : "Fecha no disponible"
                  )}
                </p>

                {/* Dirección */}
                <p className="flex items-center mb-4 text-xl">
                  <MapPinIcon className="w-8 h-8 text-white mr-2" />
                  {auction.direction.street} {auction.direction.streetNumber}{" "}
                  esq. {auction.direction.corner} -{" "}
                  {auction.direction.department}
                </p>
              </div>
            </div>

            <div className="w-3/4 h-0.5 mx-auto my-10 bg-white"></div>

            {/* Descripción centrada debajo de las columnas */}
            <div className="text-center my-8">
              <p className="text-2xl text-white">{auction.description}</p>
            </div>
          </div>

          {/* Zona del subastador (1/4) */}
          <div className="w-1/4 bg-[#F0F8FF] p-4 rounded-lg shadow-md">
            {/* Foto del subastador */}
            <div className="flex flex-col items-center mb-4">
              {/* Imagen del subastador */}
              <img
                src={auctioneer?.imageUrl || gatoCoca}
                alt={`${auctioneer?.firstName} ${auctioneer?.lastName}`}
                className="w-35 h-35 rounded-full object-cover mt-4 mb-6"
              />
              <div className="text-center">
                {/* Nombre del subastador */}
                <h2 className="text-3xl font-semibold text-[#0D4F61]">
                  {auctioneer?.firstName} {auctioneer?.lastName}
                </h2>

                {/* Reputación */}
                <p className="flex items-center text-[#0D4F61] justify-center mb-1">
                  <VerifiedIcon className="w-5 h-5 mr-2" />
                  {auctioneer?.reputation}%
                </p>
                
                {/* placa */}
                <p className="flex items-center text-[#0D4F61] justify-center mb-4">
                  <IdCard className="w-5 h-5 mr-2 inline-block" />
                  {auctioneer?.plate}
                </p>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="space-y-4 ml-8">
              {/* Email */}
              <p className="flex items-center text-[#0D4F61]">
                <MailIcon className="w-5 h-5 mr-2" />
                {auctioneer?.email}
              </p>

              {/* Teléfono */}
              <p className="flex items-center text-[#0D4F61]">
                <SmartphoneIcon className="w-5 h-5 mr-2" />
                {auctioneer?.phone}
              </p>

              {/* Dirección */}
              <p className="flex items-center text-[#0D4F61]">
                <MapPinIcon className="w-8 h-8 mr-2" />
                {auctioneer?.direction.street}{" "}
                {auctioneer?.direction.streetNumber} esq.{" "}
                {auctioneer?.direction.corner} - {auctioneer?.direction.zipCode}
                , {auctioneer?.direction.department}
              </p>
            </div>

            <div className="mt-16 text-center">
              <button className="px-6 py-2 rounded-full border-2 border-[#0D4F61] text-[#0D4F61] font-semibold hover:bg-[#0D4F61] hover:text-white transition duration-300">
                Ver perfil
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lo dejo comentado para que no te explote todo
      <Galerys
        lots={lots}
        component={AK IRIA TU COMPONENTE FA}
        className="flex w-4/5 mx-auto flex-col items-center justify-center p-1"
        internalClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      /> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <GaleryOfCards
          items={items}
          onCardClick={handleCardClick} // Tu componente tiene que ser capaz de agarrar esta funcion (Tmb va a servir para los lotes del storage porque funcionan igual)
          className="bg-[#DDE9F0] text-black p-4 rounded-lg shadow space-y-2 space-x-4 w-full flex flex-col justify-between"
        />
      </div>

      {/* SECCION DE MODAL DESPLEGALE */}
      {selectLot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-4 max-w-lg w-full relative">
            <button
              onClick={() => setselectLot(null)}
              className="absolute top-2 right-2 text-black text-xl font-bold"
            >
              ✕
            </button>

            <LotToBid
              lot={selectLot}
              onBidInitiated={suscribirseAlLote}
              className="text-black"
            />

            {/* Historial */}
            {history.length > 0 && (
              <div className="mt-4 p-4 bg-gray-100 rounded text-black">
                <h2 className="text-xl font-semibold mb-2">
                  Historial de pujas
                </h2>
                <ul className="space-y-1">
                  {history.map((entry, index) => (
                    <li key={index} className="border-b pb-1">
                      <span className="font-bold">
                        {entry.User.FirstName} {entry.User.LastName}
                      </span>{" "}
                      ofreció ${entry.Amount} a las{" "}
                      {new Date(entry.Time).toLocaleTimeString()}{" "}
                      {entry.IsAutoBid ? "(Auto)" : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
