import { useEffect, useState } from "react";
import GaleryOfLotCards from "~/components/galeryOfLotCards";
import UpdateLots from "~/components/PUTLots";
import { getAllStorageLots } from "~/services/fetchService";
import type { BasicCardItem, CompleteLot, Lot } from "~/services/types";

type Props = {
  className: string;
};

export default function MyLots({ className }: Props) {
  const [storageLots, setStorageLots] = useState<CompleteLot[]>([]);
  const [selectLot, setselectLot] = useState<CompleteLot| null>(null);

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

  const handleCloseForm = () => setselectLot(null);

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
      <h1 className="mt-50">Inventario</h1>
      <GaleryOfLotCards
        items={items}
        onCardClick={handleCardClick}
        className="bg-[#DDE9F0] text-black p-4 rounded-lg shadow space-y-2 space-x-4 w-full flex flex-col justify-between"
      />
      {selectLot && (
        <UpdateLots
          basicLot={{
            id: selectLot.id,
            title: `Lote #${selectLot.lotNumber}`,
            description: selectLot.description,
          }}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
