import React, { useState, useEffect } from "react";
import { updateAuction } from "~/services/fetchService";
import type { Auction } from "~/services/types";
import "../app.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import categorys from "~/services/categorys";
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

type UpdateAuctionButtonProps = {
  auction: Auction;
  onClose?: () => void;
};

export default function UpdateAuctionButton({
  auction,
  onClose,
}: UpdateAuctionButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState<Date | null>(null);
  const [endAt, setEndAt] = useState<Date | null>(null);
  const [status, setStatus] = useState(2);
  const [street, setStreet] = useState("");
  const [streetNumber, setStreetNumber] = useState(0);
  const [corner, setCorner] = useState("");
  const [zipCode, setZipCode] = useState(0);
  const [department, setDepartment] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<
    { id: number; name: string }[]
  >([]);

  useEffect(() => {
    if (auction) {
      setTitle(auction.title);
      setDescription(auction.description);
      setStartAt(new Date(auction.startAt));
      setEndAt(auction.endAt ? new Date(auction.endAt) : null);
      setStatus(auction.status);
      setStreet(auction.direction?.street || "");
      setStreetNumber(auction.direction?.streetNumber || 0);
      setCorner(auction.direction?.corner || "");
      setZipCode(auction.direction?.zipCode || 0);
      setDepartment(auction.direction?.department || "");
  
      // 👇 Seteamos las categorías ya asignadas
      setSelectedCategories(
        auction.category?.map((id) => ({
          id,
          name: categorys[id].name,
          icon: categorys[id].icon, // Aseguramos que los íconos se asignen
        })) || []
      );
    }
  }, [auction]);

  const closeForm = () => {
    setShowForm(false);
    onClose?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Auction = {
      id: auction.id,
      title,
      description,
      startAt: startAt ? startAt.toISOString() : "",
      endAt: endAt ? endAt.toISOString() : "",
      category: selectedCategories.map((c) => c.id),
      status,
      direction: {
        street,
        streetNumber,
        corner,
        zipCode,
        department,
      },
      auctioneer: {
        id: 0,
        first_name: "",
        last_name: "",
        email: ""
      },
      lots: []
    };

    const success = await updateAuction(payload);
    if (success) {
      closeForm();
      alert("Subasta editada con éxito");
    }
  };

  const categoryOptions = Object.entries(categorys).map(([key, label]) => ({
    id: parseInt(key),
    name: label.name,
    icon: label.icon, // Incluir el icono
  }));

  return (
    <div>
      {/* Fondo oscuro */}
      <div
        onClick={closeForm}
        className="fixed inset-0 bg-[rgba(0,0,0,0.3)] bg-opacity-60 z-40"
      />
      {/* formulario desplegable */}
      <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-white p-6 rounded shadow-lg z-50 w-full max-w-2xl max-h-[calc(100vh-4rem)] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Título */}
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-900"
          >
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
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-900"
          >
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
          <div className="relative z-65 w-full mb-6 group font-[Inter]">
            <DatePicker
              selected={startAt}
              onChange={(date: Date | null) => setStartAt(date)}
              showTimeSelect
              dateFormat="Pp"
              placeholderText="06/09/2025, 4:00 PM"
              className="peer block w-full appearance-none rounded-lg border border-[#59b9e2]/50 bg-[#1B3845] px-4 pt-5 pb-2 text-sm text-white placeholder-transparent focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition"
              wrapperClassName="w-full"
              popperClassName="datepicker-z"
              id="startAt"
            />
            <label
              htmlFor="startAt"
              className="absolute left-4 -top-3 bg-[#1B3845] px-1 text-sm text-[#81fff9] transition-all duration-200
                          peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                          peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]"
            >
              Fecha de inicio
            </label>
          </div>

          {/* Fecha de fin */}
          <div className="relative z-60 w-full mb-6 group font-[Inter]">
            <DatePicker
              selected={endAt}
              onChange={(date: Date | null) => setEndAt(date)}
              showTimeSelect
              dateFormat="Pp"
              placeholderText="06/09/2025, 4:00 PM"
              className="peer block w-full appearance-none rounded-lg border border-[#59b9e2]/50 bg-[#1B3845] px-4 pt-5 pb-2 text-sm text-white placeholder-transparent focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition"
              wrapperClassName="w-full"
              id="endAt"
            />
            <label
              htmlFor="endAt"
              className="absolute left-4 -top-3 bg-[#1B3845] px-1 text-sm text-[#81fff9] transition-all duration-200
                          peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                          peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]"
            >
              Fecha de fin
            </label>
          </div>

          {/* Categoría */}
          <div className="relative z-50 w-full mb-6 group font-[Inter]">
            <label className="block mb-2 text-sm text-[#81fff9]">
              Categorías
            </label>

            <Combobox
              value={selectedCategories}
              onChange={(selected) => setSelectedCategories(selected)}
              multiple
            >
              <div className="relative">
                <ComboboxInput
                  className="w-full rounded-lg border border-[#59b9e2]/50 bg-[#1B3845] px-4 py-2 text-sm text-white focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50"
                  onChange={(event) => setQuery(event.target.value)}
                  displayValue={(selected: { name: string }[]) =>
                    selected.map((s) => s.name).join(", ")
                  }
                />
                <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDownIcon className="w-4 h-4 text-white" />
                </ComboboxButton>
              </div>

              <ComboboxOptions className="absolute top-full left-0 z-[999] mt-1 max-h-60 w-full overflow-auto rounded-lg bg-[#1B3845] border border-[#59b9e2]/50 py-1 text-sm shadow-lg">
                {categoryOptions
                  .filter((option) =>
                    option.name.toLowerCase().includes(query.toLowerCase())
                  )
                  .map((option) => (
                    <ComboboxOption
                      key={option.id}
                      value={option}
                      className={({ active, selected }) =>
                        clsx(
                          "cursor-pointer select-none px-4 py-2",
                          active && "bg-[#59b9e2]/20",
                          selected && "font-semibold text-[#81fff9]"
                        )
                      }
                    >
                      {({ selected }) => (
                        <div className="flex items-center gap-2">
                          <CheckIcon
                            className={clsx(
                              "w-4 h-4",
                              selected ? "visible text-[#81fff9]" : "invisible"
                            )}
                          />
                          {option.name}
                        </div>
                      )}
                    </ComboboxOption>
                  ))}
              </ComboboxOptions>
            </Combobox>
          </div>

          {/* Estado */}
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-900"
          >
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Dirección
            </h3>

            <label
              htmlFor="street"
              className="block text-sm font-medium text-gray-900"
            >
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

            <label
              htmlFor="streetNumber"
              className="block text-sm font-medium text-gray-900"
            >
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

            <label
              htmlFor="corner"
              className="block text-sm font-medium text-gray-900"
            >
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

            <label
              htmlFor="zipCode"
              className="block text-sm font-medium text-gray-900"
            >
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

            <label
              htmlFor="department"
              className="block text-sm font-medium text-gray-900"
            >
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

          {/* Botones de acción */}
          <div className="flex justify-end mb-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:shadow-lg transition duration-300 ease-in-out"
            >
              Editar
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
    </div>
  );
}
