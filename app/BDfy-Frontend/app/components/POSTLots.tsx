import React, { useEffect, useState } from "react";
import { createLot } from "~/services/fetchService";
import { getAuctionsByAuctioneer } from "~/services/fetchService";
import type { FormLot } from "~/services/types";
import "../app.css";
import "react-datepicker/dist/react-datepicker.css";
import { AlertCircle, Boxes, CheckCircle, Flag } from "lucide-react";
import { useAlert } from "~/context/alertContext";
import { Alert, Snackbar } from "@mui/material";
import Title from "./FormFields/AucLotCreationFields/Title";
import LotNumber from "./FormFields/AucLotCreationFields/lotNumber";
import Image from "./FormFields/AucLotCreationFields/Image";
import Description from "./FormFields/AucLotCreationFields/Description";
import StaringPrice from "./FormFields/AucLotCreationFields/StartingPrice";
import Details from "./FormFields/AucLotCreationFields/Details";
import AuctionSelection from "./FormFields/AucLotCreationFields/SelectedAuction";

type Props = {
  className?: string;
};

export default function CreateLotButton({ className }: Props) {
  const [auctionOptions, setAuctionOptions] = useState<
    { id: number; title: string }[]
  >([]);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [lotNumber, setLotNumber] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const { showAlert, open, message, severity, handleClose } = useAlert();

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

          const combined = auctions
            .filter(
              (auction: { status: number; title: string }) =>
                auction.status === 2 || auction.status === 3
            )
            .map((auction: { id: string; title: string }) => ({
              id: auction.id,
              title: auction.title,
            }));

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
    setLoading(true);

    const payload: FormLot = {
      title,
      image: image ? image : new File([], ""),
      lotNumber: parseInt(lotNumber),
      description: description,
      startingPrice: parseInt(startingPrice),
      details: details,
      auctionId: selectedAuctionId !== null ? selectedAuctionId.toString() : "",
    };

    const success = await createLot(payload);
    if (success) {
      closeForm();
      showAlert("Lote creado con exito!", "success");
      setLoading(false);
    } else {
      showAlert("No se pudo crear el lote :c", "error");
      setLoading(false);
    }
  };

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
          severity={severity}
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
          {message}
        </Alert>
      </Snackbar>

      <button
        onClick={openForm}
        className="transition-all px-6 py-1 font-semibold flex text-center justify-between items-center space-x-2"
      >
        <Boxes size={20} />
        <span>Crear Lote</span>
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
            bg-[#D3E3EB] text-[#0D4F61] p-8 rounded-2xl z-50 max-h-[100vh] min-w-[50vh] overflow-auto"
        >
          <button
            onClick={closeForm}
            className="absolute top-3 right-5 text-[#0D4F61] hover:text-[#41c4ae] transition-colors text-xl"
          >
            ✕
          </button>

          <h2 className="text-3xl font-bold mb-6 flex flex-col text-center font-[Inter]">
            Crear lote
          </h2>

          <form onSubmit={handleSubmit} className="w-full h-full gap-4">
            {/* Título */}
            <Title
              className="flex w-full mb-4 relative"
              title={title}
              setTitle={setTitle}
            />

            {/* lotNumber */}
            <LotNumber
              className="flex w-full mb-4 relative"
              lotNumber={lotNumber}
              setLotNumber={setLotNumber}
            />

            {/* Imagen */}
            <Image
              className="flex w-full mb-8 relative"
              image={image}
              setImage={setImage}
            />

            {/* Descripción */}
            <Description
              className="flex w-full mb-8 relative"
              description={description}
              setDescription={setDescription}
            />

            {/* Precio de inicio */}
            <StaringPrice
              className="flex w-full mb-8 relative"
              startingPrice={startingPrice}
              setStartingPrice={setStartingPrice}
            />

            {/* Detalles */}
            <Details
              className="flex w-full mb-8 relative"
              details={details}
              setDetails={setDetails}
            />

            {/* Selección de subasta */}
            <AuctionSelection
              className="w-full mb-8 relative"
              selectedAuctionId={selectedAuctionId}
              setSelectedAuctionId={setSelectedAuctionId}
              auctionOptions={auctionOptions}
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
                {loading ? "Creando..." : "Crear Lote"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
