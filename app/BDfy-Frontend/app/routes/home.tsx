import type { Route } from "./+types/home";
import { useEffect, useState } from "react";
import "@splidejs/react-splide/css";
import type { AuctionCard } from "../services/types";
import CarouselAuctionCard from "~/components/auctionCard";
import { getAllAuctions } from "~/services/fetchService";
import CreateAuctionButton from "~/components/auctionForm";
import { fetchRole } from "~/services/fetchService";
import CreateLotButton from "~/components/lotForm";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const [auctions, setAuctions] = useState<AuctionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Si el usuario está autenticado, intenta obtener el rol
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true); // Si hay un token, el usuario está autenticado
    }

    const fetchUserRole = async () => {
      try {
        const data = await fetchRole(); // Llamamos a la función asíncrona

        if (data) {
          setIsAuthenticated(true); // Si la respuesta es válida, marcamos al usuario como autenticado
          setRole(data.role); // Establecemos el rol del usuario
        }
      } catch (error) {
        console.error("Error al obtener el rol del usuario:", error);
        setIsAuthenticated(false); // En caso de error, no está autenticado
      }
    };

    fetchUserRole();

    // Fetch de subastas
    async function fetchAuctions() {
      try {
        const data = await getAllAuctions();
        const activeAuctions = data.filter(
          (auction: AuctionCard) => auction.status === 1
        );
        setAuctions(activeAuctions);
        setLoading(false);
      } catch (err) {
        <div></div>
        console.error("Error al cargar las subastas:", err);
        setError("Error al cargar las subastas");
        setLoading(false);
      }
    }

    fetchAuctions();
  }, []);

  if (loading) {
    return <div className="p-6 text-white">Cargando subastas...</div>;
  }
  // if (error) {
  //   return console.error("No se pudieron cargar las subastas:", error);
  // }

  return (
    <main>
      <div className="p-6 text-white">
        <h1 className="text-3xl font-bold mb-6 flex flex-col text-center">
          Subastas disponibles
        </h1>
        <div>
          <CarouselAuctionCard auction={auctions} />
        </div>
      </div>
      <div className="">
        {isAuthenticated && role === 1 && (
          <>
            <CreateAuctionButton />
            <CreateLotButton />
          </>
        )}
      </div>
    </main>
  );
}
