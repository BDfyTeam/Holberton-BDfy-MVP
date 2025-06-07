import React, { useState } from "react";
import { createAuction } from "~/services/fetchService";
import type { AuctionCard } from "~/services/types";
import "../app.css"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CreateAuctionButton() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState<Date | null>(null);
  const [endAt, setEndAt] = useState<Date | null>(null);
  const [category, setCategory] = useState<number | "">("");
  const [status, setStatus] = useState(2);
  const [street, setStreet] = useState("");
  const [streetNumber, setStreetNumber] = useState(0);
  const [corner, setCorner] = useState("");
  const [zipCode, setZipCode] = useState(0);
  const [department, setDepartment] = useState("");
  const [details, setDetails] = useState("");

  const openForm = () => {
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: AuctionCard = {
      title,
      description,
      startAt: startAt ? startAt.toISOString() : "",
      endAt: endAt ? endAt.toISOString() : "",
      category: category === "" ? [] : [category],
      status,
      direction: {
        street,
        streetNumber,
        corner,
        zipCode,
        department,
      },
      details,
    };

    const success = await createAuction(payload);
    if (success) {
      closeForm();
      alert("Subasta creada con éxito");
    }
  };

  return (
    <div>
      <button
        onClick={openForm}
        className="fixed bottom-10 right-10 p-4 bg-blue-500 hover:bg-blue-700 text-white text-2xl font-bold py-4 px-8 rounded-full hover:shadow-lg transition duration-300 ease-in-out"
      >
        Crear Subasta
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-900">
              Título
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 p-2 mb-4 w-full text-black"
              placeholder="Título de la subasta"
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
              placeholder="Descipciones y detalles importantes de la subasta"
              required
            ></textarea>

            {/* Fecha de inicio */}
            <label htmlFor="startAt" className="block text-sm font-medium text-gray-900">
              Fecha de inicio
            </label>
            <DatePicker
              selected={startAt}
              onChange={(date: Date | null) => setStartAt(date)}
              showTimeSelect // Permite seleccionar la hora
              dateFormat="Pp" // Formato de fecha y hora
              className="border border-gray-300 p-2 mb-4 w-full text-black"
              wrapperClassName="w-full" // Asegura que el DatePicker ocupe todo el ancho del contenedor
              placeholderText="06/09/2025, 4:00 PM"
            />

            {/* Fecha de fin */}
            <label htmlFor="endAt" className="block text-sm font-medium text-gray-900">
              Fecha de fin
            </label>
            <DatePicker
              selected={endAt}
              onChange={(date: Date | null) => setEndAt(date)}
              showTimeSelect
              dateFormat="Pp"
              className="border border-gray-300 p-2 mb-4 w-full text-black"
              wrapperClassName="w-full"
              placeholderText="06/09/2025, 4:00 PM"
            />

            {/* Categoría */}
            <label htmlFor="category" className="block text-sm font-medium text-gray-900">
              Categoría
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value === "" ? "" : parseInt(e.target.value))}
              className="border border-gray-300 p-2 mb-4 w-full text-black"
            >
              <option value="">Tekenlogia</option>
              <option value="1">Muebles</option>
              <option value="2">Celulares</option>
              <option value="3">Deportes</option>
              <option value="4">Camas</option>
              <option value="5">Cafe</option>
              <option value="6">Arte</option>
              <option value="7">Joyeria</option>
              <option value="8">Autos</option>
              <option value="9">Construccion</option>
              <option value="10">Limpieza</option>
              <option value="11">VideoJuegos</option>
              <option value="12">Comida</option>
              <option value="13">Cobiertos</option>
              <option value="14">Estufas</option>
              <option value="15">Terrenos</option>
              <option value="16">Ganado</option>
              <option value="17">Pesca</option>
              <option value="18">Tacuarembó</option>
              <option value="19">Treinta y Tres</option>
            </select>

            {/* Estado */}
            <label htmlFor="status" className="block text-sm font-medium text-gray-900">
              Estado
            </label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(parseInt(e.target.value))}
              className="border border-gray-300 p-2 mb-4 w-full text-black"
            >
              <option value="1">Activo</option>
              <option value="0">Cerrada</option>
              <option value="2">Borrador</option>
            </select>

            {/* Dirección */}
            <div className="border-b border-gray-900/10 pb-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dirección</h3>
              
              <label htmlFor="street" className="block text-sm font-medium text-gray-900">
                Calle
              </label>
              <input
                type="text"
                id="street"
                name="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="border border-gray-300 p-2 mb-4 w-full text-black"
                placeholder="Calle principal"
                required
              />

              <label htmlFor="streetNumber" className="block text-sm font-medium text-gray-900">
                Número
              </label>
              <input
                type="number"
                id="streetNumber"
                name="streetNumber"
                value={streetNumber}
                onChange={(e) => setStreetNumber(parseInt(e.target.value))}
                className="border border-gray-300 p-2 mb-4 w-full text-black"
                placeholder="Número del establecimiento"
                required
              />

              <label htmlFor="corner" className="block text-sm font-medium text-gray-900">
                Esquina
              </label>
              <input
                type="text"
                id="corner"
                name="corner"
                value={corner}
                onChange={(e) => setCorner(e.target.value)}
                className="border border-gray-300 p-2 mb-4 w-full text-black"
                placeholder="Esquina con otra calle (opcional)"
              />

              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-900">
                Código Postal
              </label>
              <input
                type="number"
                id="zipCode"
                name="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(parseInt(e.target.value))}
                className="border border-gray-300 p-2 mb-4 w-full text-black"
                placeholder="Código Postal"
                required
              />

              <label htmlFor="department" className="block text-sm font-medium text-gray-900">
                Departamento
              </label>
              <select
              id="departamento"
              name="departamento"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="border border-gray-300 p-2 mb-4 w-full text-black"
            >
              <option value="">Departamento</option>
              <option value="Artigas">Artigas</option>
              <option value="Canelones">Canelones</option>
              <option value="Cerro Largo">Cerro Largo</option>
              <option value="Colonia">Colonia</option>
              <option value="Durazno">Durazno</option>
              <option value="Flores">Flores</option>
              <option value="Florida">Florida</option>
              <option value="Lavalleja">Lavalleja</option>
              <option value="Maldonado">Maldonado</option>
              <option value="Montevideo">Montevideo</option>
              <option value="Paysandú">Paysandú</option>
              <option value="Río Negro">Río Negro</option>
              <option value="Rivera">Rivera</option>
              <option value="Rocha">Rocha</option>
              <option value="Salto">Salto</option>
              <option value="San José">San José</option>
              <option value="Soriano">Soriano</option>
              <option value="Tacuarembó">Tacuarembó</option>
              <option value="Treinta y Tres">Treinta y Tres</option>
            </select>
            </div>

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
