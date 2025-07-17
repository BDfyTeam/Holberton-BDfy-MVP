import React, { useState, type JSX } from "react";
import { createAuction } from "~/services/fetchService";
import "../app.css";
import "react-datepicker/dist/react-datepicker.css";
import { AlertCircle, CheckCircle, Gavel } from "lucide-react";
import categorys from "~/services/categorys";
import type { AuctionForm } from "~/services/types";
import Title from "./FormFields/AucLotCreationFields/Title";
import Image from "./FormFields/AucLotCreationFields/Image";
import Description from "./FormFields/AucLotCreationFields/Description";
import DateFields from "./FormFields/AucLotCreationFields/Date";
import CategoryField from "./FormFields/AucLotCreationFields/Category";
import Direction from "./FormFields/Register/Direction";
import { useAlert } from "~/context/alertContext";
import { Alert, Snackbar } from "@mui/material";

type Props = {
  className?: string;
};

export default function CreateAuctionButton({ className }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
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
    { id: number; name: string; icon: JSX.Element }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const { showAlert, open, message, severity, handleClose } = useAlert();

  const openForm = () => {
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)

    const payload: AuctionForm = {
      title,
      image: image ? image : new File([], ""),
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
      showAlert("Subasta creada con exito!", "success");
      setLoading(false);
    } else {
      showAlert("No se pudo crear la subasta :c", "error");
      setLoading(false);
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
      {/* Alertas */}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{
          transition: { timeout: 1000 },
        }}
      >
        <Alert
          onClose={handleClose}
          severity={severity} // Esto se maneja desde el contexto (success o error)
          iconMapping={{
            success: <CheckCircle color="#ffffff" />,
            error: <AlertCircle color="#ffffff" />,
          }}
          sx={{
            width: "100%",
            backgroundColor: severity === "success" ? "#35DE3E" : "#F23838", // Establecemos el color de fondo según el `severity`
            color: "white",
          }}
        >
          {message} {/* El mensaje que se muestra */}
        </Alert>
      </Snackbar>


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
            bg-[#D3E3EB] text-[#0D4F61] p-8 rounded-2xl z-50 max-h-[100vh] overflow-auto"
        >
          <button
            onClick={closeForm}
            className="absolute top-3 right-5 text-[#0D4F61] hover:text-[#41c4ae] transition-colors text-xl"
          >
            ✕
          </button>

          <h2 className="text-3xl font-bold mb-6 flex flex-col text-center font-[Inter]">
            Crear subasta
          </h2>

          <form onSubmit={handleSubmit} className="w-full h-full gap-4">
            {/* Título */}
            <Title
              className="flex w-full mb-4 relative"
              title={title}
              setTitle={setTitle}
            />

            {/* Imagen */}
            <Image
              className="flex w-full mb-4 relative"
              image={image}
              setImage={setImage}
            />

            {/* Descripción */}
            <Description
              className="flex w-full mb-8 relative"
              description={description}
              setDescription={setDescription}
            />

            {/* Fecha de inicio */}
            <DateFields
              className="flex w-full space-x-4 z-60 mb-8 mt-6"
              startAt={startAt}
              endAt={endAt}
              setStartAt={setStartAt}
              setEndAt={setEndAt}
            />

            {/* Categoría */}
            <CategoryField
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              query={query}
              setQuery={setQuery}
              categoryOptions={categoryOptions}
              className="relative z-50 w-full mb-6 group font-[Inter]"
            />

            {/* Dirección */}

            <Direction
              className="w-full mb-6"
              street={street}
              setStreet={setStreet}
              streetNumber={streetNumber}
              setStreetNumber={setStreetNumber}
              corner={corner}
              setCorner={setCorner}
              zipCode={zipCode}
              setZipCode={setZipCode}
              department={department}
              setDepartment={setDepartment}
            />

            {/* Botones de acción */}
            <div className="flex justify-center mt-8">
              <button
                className="text-white font-semibold py-2 px-6 
              rounded-full transition-transform duration-500 hover:scale-110"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(13, 79, 97, 1) 0%, rgba(65, 196, 174, 1) 100%)",
                }}
                type="submit"
                disabled={loading}
              >
                {loading ? "Creando..." : "Crear Subasta"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
