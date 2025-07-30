import { useEffect, useRef, useState } from "react";
import { Room, Participant, RemoteParticipant, createLocalTracks} from "livekit-client";
import { createLiveAuction } from "~/services/fetchService";
import { getUserIdFromToken } from "~/services/handleToken";

const serverUrl = "wss://bdfy-5onx0zwj.livekit.cloud"

export default function LiveVideoClient({ auctionId }: { auctionId?: string }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>("unknown");
  const [liveToken, setLiveToken] = useState<string | null>(null);
  const [isCreatingLive, setIsCreatingLive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Funcion para crear la transmision en vivo y obtener el token
  const handleCreateLive = async () => {
    if (!auctionId) {
      setError("Se requiere un ID de subasta para iniciar la transmisión");
      return;
    }

    setIsCreatingLive(true);
    setError(null);

    try {
      const auctioneerId = getUserIdFromToken();
      if (!auctioneerId) {
        throw new Error("No se pudo obtener el ID del subastador");
      }

      const response = await createLiveAuction(auctioneerId, auctionId);
      
      if (response && response.token) {
        setLiveToken(response.token);
        return response.token;
      } else {
        throw new Error("No se recibió un token válido del servidor");
      }
    } catch (err: any) {
      console.error("Error al crear transmisión en vivo:", err);
      setError(`Error al crear transmisión: ${err.message}`);
      return null;
    } finally {
      setIsCreatingLive(false);
    }
  };

  // Permisos de la camara
  const checkPermissions = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setPermissionStatus(result.state);
      return result.state === 'granted';
    } catch (err) {
      console.log("Permission API not supported");
      return true;
    }
  };

  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length === 0) {
        throw new Error("No video tracks available");
      }

      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err: any) {
      console.error("Camera access error:", err);
      
      if (err.name === 'NotAllowedError') {
        setError("Camera permission denied. Please allow camera access and refresh.");
      } else if (err.name === 'NotFoundError') {
        setError("No camera found. Please connect a camera and try again.");
      } else if (err.name === 'NotReadableError') {
        setError("Camera is being used by another application. Please close other apps using the camera.");
      } else if (err.name === 'OverconstrainedError') {
        setError("Camera constraints not supported. Trying with basic settings.");
      } else {
        setError(`Camera error: ${err.message}`);
      }
      return false;
    }
  };

  const connectToRoom = async (token?: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      let connectionToken = token || liveToken;
      
      if (!connectionToken) {
        connectionToken = await handleCreateLive();
        if (!connectionToken) {
          setIsConnecting(false);
          return;
        }
      }

      // Checkeamos si tenemos acceso a la camara
      const hasAccess = await requestCameraAccess();
      if (!hasAccess) {
        setIsConnecting(false);
        return;
      }

      const newRoom = new Room();

      let tracks;
      try {
        tracks = await createLocalTracks({
          audio: true,
          video: {
            resolution: {
              width: 640,
              height: 480
            },
            frameRate: 15
          },
        });
      } catch (trackError: any) {
        console.error("Error creating tracks:", trackError);
        
        if (trackError.name === 'NotReadableError') {
          setError("Camera busy. Trying alternative approach...");
          tracks = await createLocalTracks({
            audio: true,
            video: true,
          });
        } else {
          throw trackError;
        }
      }

      // Assign local video track
      const localVideoTrack = tracks.find((t) => t.kind === "video");
      if (videoRef.current && localVideoTrack) {
        const mediaStream = new MediaStream([localVideoTrack.mediaStreamTrack]);
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      // Conectamos al Room
      await newRoom.connect(serverUrl, connectionToken);

      for (const track of tracks) {
        await newRoom.localParticipant.publishTrack(track);
      }

      // Event listeners
      newRoom.on("participantConnected", (participant: RemoteParticipant) => {
        console.log("Remote participant connected:", participant.identity);
      });

      newRoom.on("disconnected", () => {
        console.log("Disconnected from room");
        setRoom(null);
      });

      setRoom(newRoom);
      setError(null);
      
    } catch (err: any) {
      console.error("Connection error:", err);
      setError(`Failed to connect: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (room) {
      room.disconnect();
      setRoom(null);
    }
  };

  const retry = () => {
    setError(null);
    connectToRoom();
  };

  const startLiveAuction = async () => {
    await connectToRoom();
  };

  useEffect(() => {
    checkPermissions();
    // No conectamos automaticamente esperamos a que el usuario haga click
    
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Video en vivo</h2>
        
        {/* Status indicators */}
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              permissionStatus === 'granted' ? 'bg-green-500' : 
              permissionStatus === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm">Camera: {permissionStatus}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              room ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-gray-500'
            }`}></div>
            <span className="text-sm">
              Room: {room ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex gap-2 mb-4">
          {!room && !isConnecting && (
            <button 
              onClick={startLiveAuction}
              disabled={isCreatingLive}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {isCreatingLive ? 'Creando transmisión...' : 'Iniciar Transmisión en Vivo'}
            </button>
          )}
          
          {room && (
            <button 
              onClick={disconnect}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Disconnect
            </button>
          )}
          
          {error && (
            <button 
              onClick={retry}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
          {error.includes("permission") && (
            <div className="mt-2 text-sm">
              <p>To fix this:</p>
              <ul className="list-disc list-inside">
                <li>Click the camera icon in your browser's address bar</li>
                <li>Select "Allow" for camera access</li>
                <li>Refresh the page</li>
              </ul>
            </div>
          )}
          {error.includes("being used") && (
            <div className="mt-2 text-sm">
              <p>To fix this:</p>
              <ul className="list-disc list-inside">
                <li>Close other video applications (Zoom, Teams, etc.)</li>
                <li>Close other browser tabs using the camera</li>
                <li>Try again</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {(isConnecting || isCreatingLive) && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          <p>
            {isCreatingLive ? 'Creando transmisión en vivo...' : 'Connecting to room and accessing camera...'}
          </p>
        </div>
      )}

      {/* Success state when live token is received */}
      {liveToken && !room && !isConnecting && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <p>✅ Transmisión en vivo creada exitosamente</p>
          <p>Token recibido - Listo para conectar</p>
        </div>
      )}

      {/* Video display */}
      <div className="border rounded-lg overflow-hidden bg-black">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className="w-full max-w-2xl"
          style={{ aspectRatio: '16/9' }}
        />
        {!room && !isConnecting && !isCreatingLive && (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <p className="mb-2">
                {auctionId ? `Listo para iniciar subasta: ${auctionId}` : 'Se requiere ID de subasta'}
              </p>
              <p>Haz clic en "Iniciar Transmisión en Vivo" para comenzar</p>
            </div>
          </div>
        )}
      </div>

      {/* Room info */}
      {room && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <p>✅ Transmisión en vivo activa</p>
          <p>Subasta ID: {auctionId || 'No especificado'}</p>
          <p>Participantes: {room.remoteParticipants.size + 1}</p>
        </div>
      )}
    </div>
  );
}