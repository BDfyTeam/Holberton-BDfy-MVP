import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/context/authContext";
import { registerUser } from "~/services/fetchService";
import type { RegisterUser } from "~/services/types";
import { Snackbar, Alert } from "@mui/material";
import Name from "./FormFields/Register/Name";
import Email from "./FormFields/Register/Email";
import Password from "./FormFields/Register/Password";
import Document from "./FormFields/Register/Document";
import Phone from "./FormFields/Register/Phone";
import Direction from "./FormFields/Register/Direction";
import { AlertCircle, CheckCircle, HandCoins, ShoppingCart } from "lucide-react";
import { useAlert } from "~/context/alertContext";

type Props = {
  className?: string;
};

export default function PostUser({ className }: Props) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reputation] = useState(75);
  const [phone, setPhone] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [role] = useState(0);
  const [street, setStreet] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [corner, setCorner] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [department, setDepartment] = useState("");
  const [isAdmin] = useState(false);
  // const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showAlert, open, message, severity, handleClose } = useAlert();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const payload: RegisterUser = {
      firstName,
      lastName,
      email,
      password,
      ci: documentNumber,
      reputation,
      phone,
      role,
      direction: {
        street,
        streetNumber: parseInt(streetNumber),
        corner,
        zipCode: parseInt(zipCode),
        department,
      },
      userDetails: {
        IsAdmin: isAdmin,
      },
    };

    try {
      const token = await registerUser(payload);
      login(token);
      navigate("/");
      showAlert("Usuario registrado exitosamente", "success");
    } catch (err: any) {
      console.error("Error al registrar usuario:", err);
      showAlert("Error al registrar el usuario", "error");
    }
    setLoading(false);
    return;
  }

  return (
    <div
      className={className}
      style={{
        background:
          "linear-gradient(315deg,rgba(13, 79, 97, 1) 0%, rgba(65, 196, 174, 1) 100%)",
      }}
    >
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


      {/* Formulario */}
      <div className="flex w-1/2 h-auto py-15 px-20 bg-[#D3E3EB] rounded-2xl text-[#0D4F61]">
        <form
          className="w-full h-full gap-4"
          onSubmit={handleSubmit}
        >
          {/* Nombre completo */}
          <Name
            className="flex w-full mt-2 mb-4"
            firstName={firstName}
            lastName={lastName}
            setFirstName={setFirstName}
            setLastName={setLastName}
          />

          {/* Email */}
          <Email
            email={email}
            setEmail={setEmail}
            className="flex w-full mb-4 relative"
          />

          {/* Contraseña */}
          <Password
            password={password}
            setPassword={setPassword}
            classNames="flex w-full mb-4 relative"
          />

          {/* Número de documento */}
          <Document
            documentNumber={documentNumber}
            setDocumentNumber={setDocumentNumber}
            className="flex w-full mb-4 relative"
          />

          {/* Telefono */}
          <Phone
            phone={phone}
            setPhone={setPhone}
            className="flex w-full mb-4 relative"
          />

          {/* Direccion */}
          <Direction
            className="w-full mb-2"
            street={street}
            streetNumber={streetNumber}
            corner={corner}
            zipCode={zipCode}
            department={department}
            setStreet={setStreet}
            setStreetNumber={setStreetNumber}
            setCorner={setCorner}
            setZipCode={setZipCode}
            setDepartment={setDepartment}
          />

          {/* Botones */}
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
              {loading ? "Registrando..." : "Registrarse"}
            </button>
          </div>
        </form>
      </div>
      
       {/* Información adicional (derecha) */}
       <div className="flex flex-col w-1/2 p-8 my-auto items-center text-center text-white">
        <h1 className="text-4xl font-semibold mb-12">FORMULARIO DE OFERENTES</h1>
        <h2 className="text-2xl font-light mb-4">Bienvenido a BDfy</h2>
        <p className="text-sm mb-10">
          Como oferente, podrás pujar por diferentes lotes en tiempo real. Este formulario te permitirá crear una cuenta
          para comenzar a hacer ofertas en nuestras subastas en vivo.
        </p>
        <div className="flex gap-6">
          <div className="flex flex-col items-center hover:drop-shadow-[0_0_6px_#ffffff] transition duration-300">
            <ShoppingCart size={48} className="text-white mb-2" />
            <p>Compra de lotes</p>
          </div>
          <div className="flex flex-col items-center hover:drop-shadow-[0_0_6px_#ffffff] transition duration-300">
            <HandCoins size={48} className="text-white mb-2" />
            <p>Realiza ofertas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
