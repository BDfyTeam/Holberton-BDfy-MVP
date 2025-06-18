import { useState } from "react";
import { useNavigate } from "react-router";
import Button from "~/components/functionButton";
import Header from "~/components/Header";
import { loginUser } from "~/services/fetchService";
import { Mail, Lock, Eye, EyeOff, Gavel, Trophy } from "lucide-react";
import { useAuth } from "~/context/authContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = await loginUser(email, password);
      login(token);
      navigate("/");
    } catch (error: any) {
      setError(error.message || "Inicio de sesión fallido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[rgb(60,63,96)] to-[rgb(28,148,180)]">
      {/* Contenido principal */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="flex bg-white/10 rounded-xl shadow-xl overflow-hidden max-w-6xl w-full">
          {/* Panel Izquierdo */}
          <aside className="w-1/3 p-8 text-white flex flex-col items-center justify-center bg-[rgb(168,175,234)]/20">
            <Gavel className="h-12 w-12 text-[rgb(60,63,96)] mb-4" />
            <h3 className="font-bold text-lg mb-2 text-center">Bienvenido de vuelta</h3>
            <p className="text-sm text-center">Accede a tu cuenta para continuar</p>
          </aside>

          {/* Formulario de login */}
          <section className="w-1/3 bg-gradient-to-b bg-[rgb(168,175,234)]/20 p-8 flex flex-col justify-center">
            <h1 className="text-white text-2xl font-semibold text-center mb-8">Login</h1>
            <form onSubmit={handleSubmit} className="bg-[rgb(168,175,234)] p-6 rounded-lg space-y-4">
              {/* Email */}
              <div>
                <label className="block text-white font-semibold mb-2" htmlFor="email">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@email.com"
                    className="pl-10 w-full p-2 bg-white/20 border border-white/30 text-white placeholder-white/70 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                    required
                  />
                </div>
              </div>
              {/* Password */}
              <div>
                <label className="block text-white font-semibold mb-2" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 w-full p-2 bg-white/20 border border-white/30 text-white placeholder-white/70 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Cargando..." : "Iniciar Sesión"}
              </Button>
              {error && (
                <div className="text-red-600 text-sm text-center font-medium mt-2 bg-red-100 p-2 rounded">
                  {error}
                </div>
              )}
              <div className="text-center">
                <a href="#" className="text-sm text-[rgb(60,63,96)] underline hover:text-[rgb(28,148,180)] transition">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </form>
          </section>

          {/* Panel Derecho */}
          <aside className="w-1/3 p-8 text-white flex flex-col items-center justify-center bg-[rgb(168,175,234)]/20">
            <Trophy className="h-12 w-12 text-[rgb(60,63,96)] mb-4" />
            <h3 className="font-bold text-lg mb-2 text-center">Subastas Exclusivas</h3>
            <p className="text-sm text-center">Accede a las mejores oportunidades</p>
          </aside>
        </div>
      </main>
    </div>
  );
}
