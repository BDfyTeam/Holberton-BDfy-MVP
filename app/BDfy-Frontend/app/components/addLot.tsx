import { useEffect, useState } from "react";
import { getAllStorageLots, updateLot } from "~/services/fetchService";
import type { Auction, CompleteLot, FormLot } from "~/services/types";

type AddLotProps = {
  auction: Auction;
  onClose?: () => void;
};

export default function AddLot({ auction, onClose }: AddLotProps) {
  const [storedLots, setStoredLots] = useState<any[]>([]);
  const [selectedLots, setSelectedLots] = useState<any[]>([]);

  const toggleLotSelection = (lot: CompleteLot) => {
    const alreadySelect = selectedLots.find((l) => l.id === lot.id);
    if (alreadySelect) {
      setSelectedLots(selectedLots.filter((l) => l.id !== lot.id));
    } else {
      setSelectedLots([...selectedLots, lot]);
    }
  };

  const handleUpdate = async () => {
    try {
      const updatePromises = selectedLots.map((lot: CompleteLot) => {
        const payload: FormLot = {
          id: lot.id,
          title: lot.title,
          image: lot.imageUrl,
          lotNumber: lot.lotNumber,
          description: lot.description,
          startingPrice: lot.startingPrice,
          details: lot.details,
          auctionId: auction.id || "",
        };

        return updateLot(payload);
      });

      await Promise.all(updatePromises)
      
      alert("Lotes agregados con exito.");
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

  if (!storedLots || storedLots.length === 0) {
    return (
      <div className="max-w-screen-xl mx-auto">
        <p className="text-center text-gray-500">
          No hay Lotes almacenados en el inventario.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Fondo oscuro */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[rgba(0,0,0,0.3)] bg-opacity-60 z-40"
      ></div>

      {/* Modal */}
      <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-white p-6 rounded shadow-lg z-50 w-[90%] max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg text-black font-bold mb-4">
          Inventario de Lotes
        </h2>

        <div className="grid grid-cols-5 gap-4 p-4">
          {storedLots.map((lot, idx) => {
            const isSelected = selectedLots.some((l) => l.id === lot.id);
            return (
              <div
                key={idx}
                onClick={() => toggleLotSelection(lot)}
                className={`cursor-pointer border-2 rounded p-4 shadow 
                  ${
                    isSelected
                      ? "border-blue-600 bg-blue-100"
                      : "border-gray-300 bg-white"
                  } text-black`}
              >
                <h3 className="font-bold text-2xl mb-4">{lot.title}</h3>
                <img
                  src={lot.imageUrl}
                  alt={lot.title}
                  className="w-full h-32 object-cover mb-4 rounded"
                />
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Lote #{lot.lotNumber || idx + 1}</strong>
                </p>
                <p className="text-sm text-gray-800 mb-2">
                  Descripción: {lot.description || "Sin descripción"}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300">
            Cancelar
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Guardar
          </button>
        </div>
      </div>
    </>
  );
}
