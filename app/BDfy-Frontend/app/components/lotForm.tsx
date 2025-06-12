import React, { useEffect, useState } from "react";
import { createLot } from "~/services/fetchService";
import getAuctionsByAuctioneer from "~/services/fetchService";
import type { LotCard } from "~/services/types";
import "../app.css"
import "react-datepicker/dist/react-datepicker.css";
import { getUserIdFromToken } from "~/services/handleToken";

export default function CreateLotButton() {
  const [auctionOptions, setAuctionOptions] = useState<{ id: number; title: string }[]>([]);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [lotNumber, setLotNumber] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState(0);
  const [details, setDetails] = useState("");

  const openForm = () => {
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
  };

  
  useEffect(() => {
    if (showForm) {
      const fetchAuctions = async () => {
        try {
          const auctions = await getAuctionsByAuctioneer();

          const combined = [
            ...auctions.map((auction: { id: number; title: string }) => ({
              id: auction.id, title: auction.title }))
          ];
          setAuctionOptions(combined);
        } catch (error) {
          console.error("Error cargando opciones de subasta", error);
      }
    };

    fetchAuctions();
    }
  }, [showForm]); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: LotCard = {
      lotNumber: parseInt(lotNumber),
      description: description,
      startingPrice: startingPrice,
      details: details,
      auctionId: selectedAuctionId !== null ? selectedAuctionId.toString() : ""
    };

    const success = await createLot(payload);
    if (success) {
      closeForm();
      alert("Lote creado con éxito");
    }
  };

  return (
    <div>
      <button
        onClick={openForm}
        className="fixed bottom-10 right-75 p-4 bg-blue-500 hover:bg-blue-700 text-white text-2xl font-bold py-4 px-8 rounded-full hover:shadow-lg transition duration-300 ease-in-out"
      >
        Crear Lote
      </button>
      {/* Fondo oscuro */}
      {showForm && (
        <div
          onClick={closeForm}
          className="fixed inset-0 bg-[rgba(0,0,0,0.3)] bg-opacity-60 z-40"
        />
      )}
      {/* formulario desplegable */}
      {showForm && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-white p-6 rounded shadow-lg z-50 w-200 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            {/* Título */}
            <label htmlFor="lotNumber" className="block text-sm font-medium text-gray-900">
              Numero del Lote
            </label>
            <input
              type="text"
              id="lotNumber"
              name="lotNumber"
              value={lotNumber}
              onChange={(e) => setLotNumber(e.target.value)}
              className="border border-gray-300 p-2 mb-4 w-full text-black"
              placeholder="Numero del lote"
              required
            />

            {/* Descripción */}
            <label htmlFor="description" className="block text-sm font-medium text-gray-900">
              Descripción
            </label>
            <textarea
              name="description"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-gray-300 p-2 mb-4 w-full text-black"
              placeholder="Descipciones y detalles importantes del lote"
              required
            ></textarea>

            {/* Precio de inicio */}
              <label htmlFor="startingPrice" className="block text-sm font-medium text-gray-900">
                Precio inicial
              </label>
              <input
                type="number"
                id="startingPrice"
                name="startingPrice"
                value={startingPrice}
                onChange={(e) => setStartingPrice(parseInt(e.target.value))}
                className="border border-gray-300 p-2 mb-4 w-full text-black"
                required
              />

            {/* Detalles */}
            <label htmlFor="details" className="block text-sm font-medium text-gray-900">
              Detalles
            </label>
            <textarea
              name="details"
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="border border-gray-300 p-2 mb-4 w-full text-black"
            ></textarea>

            {/* Selección de subasta */}
            <label htmlFor="auctionId" className="block text-sm font-medium text-gray-900">
              Seleccionar Subasta
            </label>
            <select
              id="auctionId"
              name="auctionId"
              value={selectedAuctionId ?? ""}
              onChange={(e) => setSelectedAuctionId(e.target.value)}
              className="border border-gray-300 p-2 mb-4 w-full text-black"
              required
            >
              <option value="">Seleccione una subasta</option>
              {auctionOptions.map((auction) => (
                <option key={auction.id} value={auction.id}>
                  {auction.title}
                </option>
              ))}
            </select>
            
            {/* Botones de acción */}
            <div className="flex justify-end mb-4">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:shadow-lg transition duration-300 ease-in-out"
              >
                Crear
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2 hover:shadow-lg transition duration-300 ease-in-out"
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
