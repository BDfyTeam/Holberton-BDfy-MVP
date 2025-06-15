import { useEffect, useState } from "react";
import { getAllStorageLots, updateAuction } from "~/services/fetchService";
import type { AuctionCard } from "~/services/types";

type AddLotProps = {
  auction: AuctionCard;
  onClose?: () => void;
};

export default function AddLot({ auction, onClose }: AddLotProps) {
  const [storedLots, setStoredLots] = useState<any[]>([]);

  const handleUpdate = async () => {
    try {
      const updatedAuction = {
        ...auction,
        lots: storedLots,
      };

      await updateAuction(updatedAuction);
      alert("Subasta actualizada con los lotes del storage.");
      onClose?.();
    } catch (err) {
      console.error("Error al actualizar subasta desde addLots:", err);
    }
  };

  useEffect(() => {
    const fetchLots = async () => {
      const lots = await getAllStorageLots();
      setStoredLots(lots || []);
    };

    fetchLots();
  }, []);

  return (
    <>
      {/* Fondo oscuro */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
      />

      {/* Modal */}
      <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-white p-6 rounded shadow-lg z-50 w-[90%] max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Inventario de Lotes</h2>

        <div className="grid grid-cols-5 gap-4 p-4">
          {storedLots.map((lot, idx) => (
            <div key={idx} className="bg-white shadow rounded p-4">
              {lot.title || `Lote ${idx + 1}`}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300">
            Cancelar
          </button>
          <button onClick={handleUpdate} className="px-4 py-2 rounded bg-blue-600 text-white">
            Guardar
          </button>
        </div>
      </div>
    </>
  );
}
