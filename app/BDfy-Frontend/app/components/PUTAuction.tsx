import React, { useState, useEffect, type JSX } from "react";
import { updateAuction } from "~/services/fetchService";
import type { Auction, AuctionForm } from "~/services/types";
import "../app.css";
import "react-datepicker/dist/react-datepicker.css";
import categorys from "~/services/categorys";
import { useAlert } from "~/context/alertContext";
import { Alert, Snackbar } from "@mui/material";
import { AlertCircle, CheckCircle } from "lucide-react";
import Direction from "./FormFields/Register/Direction";
import CategoryField from "./FormFields/AucLotCreationFields/Category";
import DateFields from "./FormFields/AucLotCreationFields/Date";
import Description from "./FormFields/AucLotCreationFields/Description";
import Image from "./FormFields/AucLotCreationFields/Image";
import Title from "./FormFields/AucLotCreationFields/Title";
import StatusField from "./FormFields/AucLotCreationFields/StatusSelect";

type Props = {
  auction: Auction;
  onClose?: () => void;
  className?: string;
};

export default function UpdateAuctionButton({
  auction,
  onClose,
  className,
}: Props) {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState<Date | null>(null);
  const [endAt, setEndAt] = useState<Date | null>(null);
  const [status, setStatus] = useState(2);
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

  useEffect(() => {
    if (auction) {
      setTitle(auction.title);
      const backendImage = auction.imageUrl;
      if (typeof backendImage === "object") {
        setImage(backendImage);
      }
      setDescription(auction.description || "");
      setStartAt(new Date(auction.startAt));
      setEndAt(auction.endAt ? new Date(auction.endAt) : null);
      setStatus(auction.status);
      setStreet(auction.direction?.street || "");
      setStreetNumber(String(auction.direction?.streetNumber || ""));
      setCorner(auction.direction?.corner || "");
      setZipCode(String(auction.direction?.zipCode || ""));
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
    onClose?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: AuctionForm = {
      id: auction.id,
      title,
      image: image ?? new File([], ""),
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

    const success = await updateAuction(payload);
    if (success) {
      closeForm();
      showAlert("Subasta editada con exito!", "success");
      setLoading(false);
    } else {
      showAlert("No se pudo editar la subasta :c", "error");
      setLoading(false);
    }
  };

  const categoryOptions = Object.entries(categorys).map(([key, label]) => ({
    id: parseInt(key),
    name: label.name,
    icon: label.icon, // Incluir el icono
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

      {/* Fondo oscuro */}
      <div
        onClick={closeForm}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />
      {/* formulario desplegable */}
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
          Editar subasta
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

          {/* Estado */}
          <StatusField
            status={status}
            setStatus={setStatus}
            className="relative z-40 w-full mb-6"
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
              {loading ? "Creando..." : "Editar Subasta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
