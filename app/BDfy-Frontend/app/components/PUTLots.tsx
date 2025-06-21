import { useEffect, useState } from "react";
import {
  getAuctionsByAuctioneer,
  getLotById,
  updateLot,
} from "~/services/fetchService";
import type { BasicCardItem, Lot, LotCard } from "~/services/types";

type Props = {
  basicLot: BasicCardItem;
  onClose?: () => void;
  className?: string;
};

export default function UpdateLots({ basicLot, onClose, className }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [auctionOptions, setAuctionOptions] = useState<
    { id: number; title: string }[]
  >([]);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(
    null
  );
  const [lotNumber, setLotNumber] = useState("");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState("");
  const [startingPrice, setStartingPrice] = useState("");

  useEffect(() => {
    async function fetchLot() {
      try {
        const lot = await getLotById(basicLot.id);
        return lot;
      } catch (err) {
        console.error("Error trayendo el lote:", err);
      }
    }

    fetchLot().then((lot) => {
      if (lot) {
        setLotNumber(lot.lotNumber);
        setDescription(lot.descripción);
        setDetails(lot.details);
        setStartingPrice(lot.startingPrice);
        setSelectedAuctionId(lot.endingPrice);
      }
    });
    setShowForm(true);
  }, [basicLot]);

  function closeForm() {
    setShowForm(false);
    onClose?.();
  }

  useEffect(() => {
    if (showForm) {
      const fetchAuctions = async () => {
        try {
          const auctions = await getAuctionsByAuctioneer();

          const combined = [
            ...auctions.map((auction: { id: number; title: string }) => ({
              id: auction.id,
              title: auction.title,
            })),
          ];
          setAuctionOptions(combined);
        } catch (error) {
          console.error("Error cargando opciones de subasta", error);
        }
      };

      fetchAuctions();
    }
  }, [showForm]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: LotCard = {
      id: basicLot.id,
      lotNumber: parseInt(lotNumber),
      description: description,
      details: details,
      startingPrice: parseInt(startingPrice),
      auctionId: selectedAuctionId ?? "",
    };

    const success = await updateLot(payload);
    if (success) {
      closeForm();
      alert("Subasta editada con éxito");
    }
  }

  return (
    <div className={className}>
      {/* Fondo oscuro */}
      {showForm && (
        <div
          onClick={closeForm}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        />
      )}
      {/* formulario desplegable */}
      {showForm && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
          w-full max-w-xl bg-[#1B3845] text-white p-8 rounded-2xl shadow-2xl 
          z-50 overflow-visible max-h-[90vh] border border-[#59b9e2]/50 backdrop-blur-sm"
        >
          <button
            onClick={closeForm}
            className="absolute top-3 right-5 text-white hover:text-[#81fff9] transition-colors text-xl"
          >
            ✕
          </button>

          <h2 className="text-3xl font-bold mb-6 flex flex-col text-center font-[Inter]">
            Editar lote
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Título */}
            <div className="relative z-0 w-full mb-6 group font-[Inter]">
              <input
                type="text"
                id="lotNumber"
                name="lotNumber"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                className="peer block w-full appearance-none rounded-lg border border-[#59b9e2]/50 bg-[#1B3845] px-4 pt-5 pb-2 text-sm text-white placeholder-transparent focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition"
                placeholder="Número del lote"
                required
              />
              <label
                htmlFor="lotNumber"
                className="absolute left-4 -top-3 bg-[#1B3845] px-1 text-sm text-[#81fff9] transition-all duration-200
                  peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                  peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]"
              >
                Número del Lote
              </label>
            </div>

            {/* Descripción */}
            <div className="relative z-0 w-full mb-6 group font-[Inter]">
              <textarea
                name="description"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="peer block w-full appearance-none rounded-lg border border-[#59b9e2]/50 bg-[#1B3845] px-4 pt-5 pb-2 text-sm text-white placeholder-transparent focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition resize-none min-h-[120px]"
                placeholder="Descripción"
                required
              ></textarea>
              <label
                htmlFor="description"
                className="absolute left-4 -top-3 bg-[#1B3845] px-1 text-sm text-[#81fff9] transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60 peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]"
              >
                Descripción
              </label>
            </div>

            {/* Precio de inicio */}
            <div className="relative z-0 w-full mb-6 group font-[Inter]">
              <input
                type="text"
                id="startingPrice"
                name="startingPrice"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                className="peer block w-full appearance-none rounded-lg border border-[#59b9e2]/50 bg-[#1B3845] px-4 pt-5 pb-2 text-sm text-white placeholder-transparent focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition"
                placeholder="Precio inicial"
                required
              />
              <label
                htmlFor="startingPrice"
                className="absolute left-4 -top-3 bg-[#1B3845] px-1 text-sm text-[#81fff9] transition-all duration-200
                  peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                  peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]"
              >
                Precio inicial
              </label>
            </div>

            {/* Detalles */}
            <div className="relative z-0 w-full mb-6 group font-[Inter]">
              <textarea
                name="details"
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="peer block w-full appearance-none rounded-lg border border-[#59b9e2]/50 bg-[#1B3845] px-4 pt-5 pb-2 text-sm text-white placeholder-transparent focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition resize-none min-h-[120px]"
                placeholder="Detalles"
              ></textarea>
              <label
                htmlFor="details"
                className="absolute left-4 -top-3 bg-[#1B3845] px-1 text-sm text-[#81fff9] transition-all duration-200
                  peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                  peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]"
              >
                Detalles
              </label>
            </div>

            {/* Selección de subasta */}
            <div className="relative z-50 w-full mb-6 group font-[Inter]">
              <select
                id="auctionId"
                name="auctionId"
                value={selectedAuctionId ?? ""}
                onChange={(e) => setSelectedAuctionId(e.target.value)}
                className="peer block w-full appearance-none rounded-lg border border-[#59b9e2]/50 bg-[#1B3845] px-4 pt-5 pb-2 text-sm text-[#81fff9] focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition"
                required
              >
                <option value="" disabled hidden></option>
                {auctionOptions.map((auction) => (
                  <option key={auction.id} value={auction.id}>
                    {auction.title}
                  </option>
                ))}
              </select>

              <label
                htmlFor="auctionId"
                className={`absolute left-4 px-1 bg-[#1B3845] text-sm text-[#81fff9] transition-all duration-200 
                  ${
                    selectedAuctionId === ""
                      ? "top-4 text-base text-[#81fff9]/60"
                      : "-top-3 text-sm"
                  }`}
              >
                Seleccionar Subasta
              </label>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-4 mb-4 font-[Inter]">
              <button
                type="submit"
                className="bg-[#81fff9] text-[#1B3845] font-semibold py-2 px-5 rounded-lg border border-[#81fff9] transition-colors duration-300 hover:bg-[#59b9e2] hover:text-white hover:border-[#59b9e2] shadow-md"
              >
                Editar
              </button>

              <button
                type="button"
                onClick={closeForm}
                className="bg-[#2c4d5a] text-[#9acfd9] font-semibold py-2 px-5 rounded-lg border border-[#406a79] transition-colors duration-300 hover:bg-[#1B3845] hover:text-[#81fff9] shadow-md"
              >
                Cerrar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
