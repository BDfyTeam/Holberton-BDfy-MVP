import React, { useState } from "react";
import { createAuction, updateAuction } from "~/services/fetchService";
import type { AuctionCard } from "~/services/types";
import "../app.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Gavel } from "lucide-react";
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

type AuctionForm = {
  className?: string;
};

export default function CreateAuctionButton({ className }: AuctionForm) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState<Date | null>(null);
  const [endAt, setEndAt] = useState<Date | null>(null);
  const [status] = useState(2);
  const [street, setStreet] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [corner, setCorner] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [department, setDepartment] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<
    { id: number; name: string }[]
  >([]);

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
      category: selectedCategories.map((c) => c.id),
      status,
      direction: {
        street,
        streetNumber: parseInt(streetNumber),
        corner,
        zipCode: parseInt(zipCode),
        department,
      },
    };

    const success = await createAuction(payload);
    if (success) {
      closeForm();
      alert("Subasta creada con éxito");
    }
  };

  // Necesario manejar las categorias asi para usarse con HeadLessUI
  const categoryOptions = categorys.map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
  }));

  return (
    <div className={className}>
      <button
        onClick={openForm}
        className="transition-all px-2 py-1 font-semibold flex items-center space-x-2"
      >
        <Gavel size={20} />
        <span>Crear Subasta</span>
      </button>

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
            bg-[#D3E3EB] text-[#0D4F61] p-8 rounded-2xl z-50 max-h-[90vh] overflow-auto"
        >
          <button
            onClick={closeForm}
            className="absolute top-3 right-5 text-white hover:text-[#81fff9] transition-colors text-xl"
          >
            ✕
          </button>

          <h2 className="text-3xl font-bold mb-6 flex flex-col text-center font-[Inter]">
            Crear subasta
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Título */}
            <div className="relative z-0 w-full mb-6 group font-[Inter]">
              <input
                type="text"
                name="title"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="peer block w-full appearance-none rounded-lg border border-[#59b9e2]/50 bg-[#1B3845] px-4 pt-5 pb-2 text-sm text-white placeholder-transparent focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition"
                placeholder="Título"
                required
              />
              <label
                htmlFor="title"
                className="absolute left-4 -top-3 bg-[#1B3845] px-1 text-sm text-[#81fff9] transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60 peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]"
              >
                Título
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
                                selected
                                  ? "visible text-[#81fff9]"
                                  : "invisible"
                              )}
                            />
                            <span className="flex items-center gap-2">
                              {option.icon && (
                                <span className="mr-2">{option.icon}</span>
                              )}
                              {option.name}
                            </span>
                          </div>
                        )}
                      </ComboboxOption>
                    ))}
                </ComboboxOptions>
              </Combobox>
            </div>

            {/* Dirección */}
            <div className="border-b border-gray-900/10 pb-12 font-[Inter]">
              <h3 className="text-lg font-semibold text-[#81fff9] mb-2">
                Dirección
              </h3>
              <div className="h-0.5 bg-[#81fff9] w-full mb-6 rounded" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Calle */}
                <div className="relative z-0 w-full group">
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="peer block w-full appearance-none rounded-lg border border-[#59b9e2]/50 bg-[#1B3845] px-4 pt-3.5 pb-4 text-sm text-white placeholder-transparent focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition"
                    placeholder="Calle"
                    required
                  />
                  <label
                    htmlFor="street"
                    className="absolute left-4 bg-[#1B3845] px-1 text-sm text-[#81fff9] transition-all duration-200 
                      peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60 
                      peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]"
                  >
                    Calle
                  </label>
                </div>

                {/* Número */}
                <div className="relative z-0 w-full group">
                  <input
                    type="text"
                    id="streetNumber"
                    name="streetNumber"
                    value={streetNumber}
                    onChange={(e) => setStreetNumber(e.target.value)}
                    className="peer block w-full appearance-none rounded-lg border border-[#59b9e2]/50 bg-[#1B3845] px-4 pt-3.5 pb-4 text-sm text-white placeholder-transparent focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition"
                    placeholder="Número"
                    required
                  />
                  <label
                    htmlFor="streetNumber"
                    className="absolute left-4 bg-[#1B3845] px-1 text-sm text-[#81fff9] transition-all duration-200 
                      peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60 
                      peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]"
                  >
                    Número
                  </label>
                </div>

                {/* Esquina */}
                <div className="relative z-0 w-full group">
                  <input
                    type="text"
                    id="corner"
                    name="corner"
                    value={corner}
                    onChange={(e) => setCorner(e.target.value)}
                    className="peer block w-full appearance-none rounded-lg border border-[#59b9e2]/50 bg-[#1B3845] px-4 pt-3.5 pb-4 text-sm text-white placeholder-transparent focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition"
                    placeholder="Esquina"
                  />
                  <label
                    htmlFor="corner"
                    className="absolute left-4 bg-[#1B3845] px-1 text-sm text-[#81fff9] transition-all duration-200 
                      peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60 
                      peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]"
                  >
                    Esquina
                  </label>
                </div>

                {/* Código Postal */}
                <div className="relative z-0 w-full group">
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="peer block w-full appearance-none rounded-lg border border-[#59b9e2]/50 bg-[#1B3845] px-4 pt-3.5 pb-4 text-sm text-white placeholder-transparent focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition"
                    placeholder="Código Postal"
                    required
                  />
                  <label
                    htmlFor="zipCode"
                    className="absolute left-4 bg-[#1B3845] px-1 text-sm text-[#81fff9] transition-all duration-200 
                      peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60 
                      peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]"
                  >
                    Código Postal
                  </label>
                </div>

                {/* Departamento */}
                <div className="relative z-0 w-full group md:col-span-2">
                  <select
                    id="department"
                    name="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="peer block w-full appearance-none rounded-lg border border-[#59b9e2]/50 bg-[#1B3845] px-4 pt-3.5 pb-4 text-sm text-[#81fff9] focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition"
                  >
                    <option value="" disabled hidden></option>
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

                  <label
                    htmlFor="department"
                    className={`absolute left-4 px-1 bg-[#1B3845] text-sm text-[#81fff9] transition-all duration-200 ${
                      department === ""
                        ? "top-4 text-base text-[#81fff9]/60"
                        : "-top-3 text-sm"
                    }`}
                  >
                    Departamento
                  </label>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-4 mb-4 font-[Inter]">
              <button
                type="submit"
                className="bg-[#81fff9] text-[#1B3845] font-semibold py-2 px-5 rounded-lg border border-[#81fff9] transition-colors duration-300 hover:bg-[#59b9e2] hover:text-white hover:border-[#59b9e2] shadow-md"
              >
                Crear
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
