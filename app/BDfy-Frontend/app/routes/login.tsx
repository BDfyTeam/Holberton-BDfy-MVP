import { useState } from "react";
import { useNavigate } from "react-router";
import Button from "~/components/functionButton";
import Header from "~/components/Header";
import { loginUser } from "~/services/fetchService";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Gavel,
  Trophy,
  CheckCircle,
  AlertCircle,
  UserCheck2,
} from "lucide-react";
import { useAuth } from "~/context/authContext";
import Email from "~/components/FormFields/Register/Email";
import Password from "~/components/FormFields/Register/Password";
import { Alert, Snackbar } from "@mui/material";
import { useAlert } from "~/context/alertContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showAlert, open, message, severity, handleClose } = useAlert();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = await loginUser(email, password);
      login(token);
      showAlert("Usuario registrado exitosamente", "success");
      navigate("/");
    } catch (error: any) {
      setError(error.message || "Inicio de sesión fallido");
      showAlert("Error al registrar el usuario", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-4/5 h-auto mt-22 mb-3 mx-auto">
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

      <div
        className="flex w-5/6 mx-auto mb-10 bg-[#0D4F61] rounded-2xl shadow-lg
         shadow-gray-700 p-2 relative overflow-visible"
        style={{
          background:
            "linear-gradient(135deg,rgba(13, 79, 97, 1) 16%, rgba(65, 196, 174, 1) 100%)",
        }}
      >
        {/* Panel Izquierdo */}
        <aside className="w-1/3 p-8 text-white flex flex-col items-center justify-center">
          <div className="hover:drop-shadow-[0_0_6px_#ffffff] transition duration-300 flex flex-col items-center justify-center">
            <UserCheck2 className="h-20 w-20 text-white mb-4" />
            <h3 className="font-bold text-2xl mb-2 text-center">
              Bienvenido de vuelta
            </h3>
            <p className="text-sm text-center">
              Accede a tu cuenta para continuar
            </p>
          </div>
        </aside>

        {/* Formulario de login */}
        <section className="flex flex-col w-1/3 h-auto py-15 px-20 bg-[#D3E3EB] rounded-2xl text-[#0D4F61]">
          <h1 className="text-2xl font-bold text-center mb-8">
            INICIAR SESIÓN
          </h1>
          <form onSubmit={handleSubmit} className="w-full h-full gap-4">
            {/* Email */}
            <Email
              email={email}
              setEmail={setEmail}
              className="mb-5 relative"
            />
            {/* Password */}
            <Password
              password={password}
              setPassword={setPassword}
              classNames="mb-5 relative"
            />
            {/* Boton */}
            <div className="flex justify-center mt-15 mb-4">
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

            <div className="text-center">
              <a
                href="#"
                className="text-sm text-[rgb(60,63,96)] underline hover:text-[rgb(28,148,180)] transition"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </form>
        </section>

        {/* Panel Derecho */}
        <aside className="w-1/3 p-8 text-white flex flex-col items-center justify-center">
          <div className="hover:drop-shadow-[0_0_6px_#ffffff] transition duration-300 flex flex-col items-center justify-center">
            <Trophy className="h-20 w-20 text-white mb-4" />
            <h3 className="font-bold text-2xl mb-2 text-center">
              Subastas Exclusivas
            </h3>
            <p className="text-sm text-center">
              Accede a las mejores oportunidades
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
