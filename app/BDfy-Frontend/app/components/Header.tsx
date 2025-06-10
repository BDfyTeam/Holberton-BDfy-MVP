import { NavBar } from "./navBar";
import DynamicButton from "./navegationButton";
import UserMenu from "./UserMenu";
import { useLocation } from "react-router-dom";

export default function Header() {
  const isAuthenticated =
    typeof window !== "undefined" && !!localStorage.getItem("token");

  // SACAMOS LA RUTA ACTUAL PARA VALIDAR LA RUTA ACTUAL DEL USUARIO
  const location = useLocation();
  const path = location.pathname;

  return (
    <header className="w-full bg-white/20 py-4 px-8 flex items-center justify-between">
      {/* Logo + nombre */}
      <div className="flex items-center space-x-4">
        <span className="text-white text-2xl">🔨</span>
        <div className="text-white text-2xl font-bold">
        <DynamicButton to="/" children="BDfy" />
        </div>
      </div>
      {!isAuthenticated && (
        <div className="hidden md:flex space-x-4">
          <div className="hidden md:flex space-x-4">
            {(path === "/" || path === "/login") && (
              <NavBar to="/register">Registrarme</NavBar>
            )}
            {(path === "/" || path === "/register") && (
              <NavBar to="/login">Iniciar Sesión</NavBar>
            )}
          </div>
        </div>
      )}

      {/* Menú de usuario */}
      {isAuthenticated && <UserMenu />}
    </header>
  );
}
