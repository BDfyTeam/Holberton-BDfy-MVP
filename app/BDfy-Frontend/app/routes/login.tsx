import { useState } from "react";
import { useNavigate } from "react-router"; // Para redireccionar después del login
import Button from "~/components/Button";
import Input from "~/components/Input";
import { loginUser } from "~/services/authService"; // Funcion de login que creamos en authService


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Lo usaremos para cambiar de página


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Limpiamos el error previo
    setLoading(true); // Indicamos que estamos cargando

    try {
      const token = await loginUser(email, password);
      localStorage.setItem("token", token); // Guardamos el token en navegador
      console.log("Login exitoso");
      navigate("/home"); // Redirigimos a la página de inicio
    } catch (error: any) {
      setError(error.message || "Inicio de sesión fallido"); // Mostramos el error al usuario
    } finally {
      setLoading(false); // Oculto el estado cargando
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(60,63,96)]">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
        <h1 className="text-[rgb(60,63,96)] text-2xl font-semibold text-center mb-6">Login</h1>

        <form onSubmit={handleSubmit} className="bg-[rgb(168,175,234)] p-6 rounded-lg space-y-4 shadow-inner">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="tucorreo@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </Button>
          
          {/* Mostramos el error si hay uno */}
          {error && (
            <div className="text-red-600 text-sm text-center font-medium mt-2 bg-red-100 p-2 rounded">
              {error}
            </div>
          )}


          <div className="text-center">
            <a href="#" className="text-sm text-[rgb(60,63,96)] underline hover:text-[rgb(28,148,180)] transition">¿Olvidaste tu contraseña?</a>
          </div>
        </form>
      </div>
    </div>
  );
}
