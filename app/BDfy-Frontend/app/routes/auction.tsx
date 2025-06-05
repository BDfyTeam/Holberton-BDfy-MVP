import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { getAuctionById } from "~/services/api";
import type { Auction } from "~/services/types";
// import LotCard from "~/components/LotCard";

export default function AuctionPage() {
  const { id } = useParams();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const data = await getAuctionById(Number(id));
        setAuction(data);
      } catch (err) {
        console.error("Error al cargar la subasta:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAuction();
  }, [id]);

  if (loading) return <p className="text-center text-white">Cargando subasta...</p>;
  if (!auction) return <p className="text-center text-red-500">Subasta no encontrada.</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-2">{auction.title}</h1>
      <p className="text-gray-300 mb-6">{auction.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* {auction.lots.map((lot) => (
          <LotCard key={lot.id} lot={lot} />
        ))} */}
      </div>
    </div>
  );
}