import { useLocation } from "react-router-dom";
import { NavBar } from "./navBar";
import DynamicButton from "./navegationButton";
import UserMenu from "./UserMenu";
import { useAuth } from "~/context/authContext";
import { Gavel } from "lucide-react";

export default function Header() {
  const { isAuthenticated, logout } = useAuth();

  const location = useLocation();
  const path = location.pathname;

  return (
    <header className="w-full py-4 px-8 flex bg-[#1b3845] items-center justify-between border-b-3 border-[#6cf2ff] transition-colors duration-300 hover:border-[#81fff9] hover:drop-shadow-[0_0_6px_#59b9e2]">
      {/* Logo + nombre */}
      <div className="flex items-center space-x-4 group">
        <DynamicButton
          to="/"
          className="w-15 h-15 flex items-center justify-center rounded-full bg-[#59b9e2] text-white group-hover:drop-shadow-[0_0_6px_#59b9e2] transition duration-300"
        >
          <Gavel className="text-white w-10 h-10 transition-transform duration-300 group-hover:rotate-30" />
        </DynamicButton>

        <DynamicButton
          to="/"
          className="text-white text-3xl font-extrabold tracking-wide group-hover:drop-shadow-[0_0_6px_#59b9e2] transition duration-300"
        >
          <span className="text-[#59b9e2]">BD</span>fy
        </DynamicButton>
      </div>

      {!isAuthenticated && (
        <div className="hidden md:flex space-x-4">
          {(path === "/" || path === "/login") && (
            <NavBar to="/register">Registrarme</NavBar>
          )}
          {(path === "/" || path === "/register") && (
            <NavBar to="/login">Iniciar Sesión</NavBar>
          )}
        </div>
      )}

      {/* Menú de usuario */}
      {isAuthenticated && <UserMenu />}
    </header>
  );
}
