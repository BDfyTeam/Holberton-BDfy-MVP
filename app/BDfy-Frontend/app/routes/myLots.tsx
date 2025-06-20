import { useEffect, useState } from "react";
import GaleryOfCards from "~/components/galeryOfCards";
import { getAllStorageLots } from "~/services/fetchService";
import type { BasicCardItem, CompleteLot } from "~/services/types";


type Props = {
    className: string;
}

export default function MyLots({ className }: Props) {
  const [storageLots, setStorageLots] = useState<CompleteLot[]>([]);
    const [selectLot, setselectLot] = useState<CompleteLot | null>(null);
  

  useEffect(() => {
    async function fetchAuctions() {
      try {
        setStorageLots(await getAllStorageLots());
      } catch (error) {
        console.error("Error al cargar las subastas:", error);
      }
    }
    fetchAuctions();
  }, []);

  const items = storageLots.map((lot) => ({
    id: lot.id,
    title: `Lote #${lot.lotNumber}`,
    description: lot.description,
    // category: lot.category
  }));

  const handleCardClick = (item: BasicCardItem) => {
    const lote = storageLots.find((l) => l.id === item.id);
    if (lote) setselectLot(lote);
  };

  return (
    <div className={className}>
      <h1>Inventario</h1>
      <GaleryOfCards 
        items={items} 
        onCardClick={handleCardClick}
        className="bg-[#DDE9F0] text-black p-4 rounded-lg shadow space-y-2 space-x-4 w-full flex flex-col justify-between"
    />
    </div>
  );
}
