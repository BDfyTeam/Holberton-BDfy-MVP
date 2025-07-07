import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/context/authContext";
import { registerUser } from "~/services/fetchService";
import type { RegisterUser } from "~/services/types";
import { Snackbar, Alert } from "@mui/material";
import Name from "./CamposFormularios/Name";
import Email from "./CamposFormularios/Email";
import Password from "./CamposFormularios/Password";
import Document from "./CamposFormularios/Document";
import Phone from "./CamposFormularios/Phone";
import Direction from "./CamposFormularios/Direction";

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
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

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
    } catch (err: any) {
      console.error("Error al registrar usuario:", err);
      setMessage(err.message || "Error al registrar el usuario");
      setOpen(true);
    }
    setLoading(false);
    return;
  }

  function handleClose() {
    setOpen(false);
  }

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
          severity="error"
          sx={{
            width: "100%",
            backgroundColor: "red",
            color: "white",
          }}
        >
          {message}
        </Alert>
      </Snackbar>

      {/* Formulario */}
      <form className="" onSubmit={handleSubmit}>
        <h2 className="">Registro como oferente</h2>

        {/* Nombre completo */}
        <div className="Nombre y apellido">
          <Name
            className=""
            firstName={firstName}
            lastName={lastName}
            setFirstName={setFirstName}
            setLastName={setLastName}
          />
        </div>

        {/* Email */}
        <div>
          <Email email={email} setEmail={setEmail} />
        </div>

        {/* Contraseña */}
        <div>
          <Password password={password} setPassword={setPassword} />
        </div>

        {/* Número de documento */}
        <div>
          <Document
            documentNumber={documentNumber}
            setDocumentNumber={setDocumentNumber}
          />
        </div>

        {/* Telefono */}
        <div>
          <Phone phone={phone} setPhone={setPhone} />
        </div>

        {/* Direccion */}
        <div>
          <Direction
            className=""
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
        </div>

        {/* Botones */}
        <div className="flex justify-center mt-8">
          <button
            className="bg-[#81fff9] text-[#1B3845] font-semibold py-2 px-6 rounded-lg border border-[#81fff9] 
              transition-colors duration-300 hover:bg-[#59b9e2] hover:text-white hover:border-[#59b9e2] 
              shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </div>
      </form>
    </div>
  );
}
