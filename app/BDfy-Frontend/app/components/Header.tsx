import { useLocation } from "react-router-dom";
import { NavBar } from "./navBar";
import DynamicButton from "./navegationButton";
import UserMenu from "./UserMenu";
import { useAuth } from "~/context/authContext";
import { Gavel, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "~/public/assets/bdfyLogo.png";

interface Props {
  className?: string;
}

export default function Header({ className }: Props) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const path = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen((p) => !p);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header
      className={`relative w-full px-4 py-2 ${className ?? ""}`}
      style={{
        background:
          "linear-gradient(180deg,rgba(39,119,145,1) 17%, rgba(255,255,255,0) 85%)",
      }}
    >
      {/* Top row */}
      <div className="flex items-center w-full">
        {/* Izquierda: logo */}
        <div className="flex items-center space-x-4 group">
          <DynamicButton
            to="/"
            className="w-14 h-14 flex items-center justify-center rounded-full bg-[#147894] group-hover:drop-shadow-[0_0_6px_#ffffff] transition duration-300"
          >
            <Gavel className="w-8 h-8 transition-transform duration-300 group-hover:rotate-30" />
          </DynamicButton>

          <DynamicButton
            to="/"
            className="text-3xl font-extrabold tracking-wide group-hover:drop-shadow-[0_0_6px_#ffffff] transition duration-300"
          >
            <img
              src={logo}
              alt="BDfy Logo"
              className="w-48 h-auto -mt-2 object-contain"
            />
          </DynamicButton>
        </div>

        {/* Desktop menú (derecha) */}
        <div className="hidden md:flex items-center gap-6 ml-auto">
          <NavBar
            to="/aboutUs"
            className="px-4 py-2 font-semibold hover:text-white hover:drop-shadow-[0_0_6px_#ffffff] transition"
          >
            Sobre nosotros
          </NavBar>
          <NavBar
            to="/all-auctions"
            className="px-4 py-2 font-semibold hover:text-white hover:drop-shadow-[0_0_6px_#ffffff] transition"
          >
            Subastas
          </NavBar>
          <NavBar
            to="/help"
            className="px-4 py-2 font-semibold hover:text-white hover:drop-shadow-[0_0_6px_#ffffff] transition"
          >
            Ayuda
          </NavBar>

          {!isAuthenticated ? (
            <>
              {(path === "/" ||
                path === "/login" ||
                path.startsWith("/auction/specific/")) && (
                <NavBar
                  to="/register"
                  className="px-4 py-2 rounded-full border-2 border-gray-200 font-semibold hover:text-white hover:drop-shadow-[0_0_6px_#ffffff] transition"
                >
                  Registrarme
                </NavBar>
              )}
              {(path === "/" ||
                path === "/register" ||
                path.startsWith("/auction/specific/")) && (
                <NavBar
                  to="/login"
                  className="px-4 py-2 rounded-full border-2 border-gray-200 font-semibold hover:text-white hover:drop-shadow-[0_0_6px_#ffffff] transition"
                >
                  Iniciar Sesión
                </NavBar>
              )}
            </>
          ) : (
            <UserMenu className="px-4 py-2 relative z-40" />
          )}
        </div>

        {/* Botón hamburguesa (mobile) */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden ml-auto p-2 rounded focus:outline-none focus:ring-2 focus:ring-white/60 mr-5"
          aria-label="Abrir menú"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Menú móvil desplegable */}
      {mobileMenuOpen && (
        <div
          className="
            absolute left-0 right-0 top-full
            mt-2 px-4 pb-4 pt-2
            flex flex-col items-start gap-3
            bg-[#277791]/95 backdrop-blur-sm
            border-t border-white/20 shadow-xl
            md:hidden
          "
        >
          <div onClick={closeMobileMenu}>
            <NavBar to="/aboutUs">
              Sobre nosotros
            </NavBar>
          </div>
          <div onClick={closeMobileMenu}>
            <NavBar to="/all-auctions">
              Subastas
            </NavBar>
          </div>
          <div onClick={closeMobileMenu}>
            <NavBar to="/help">
              Ayuda
            </NavBar>
          </div>

          {!isAuthenticated ? (
            <>
              {(path === "/" ||
                path === "/login" ||
                path.startsWith("/auction/specific/")) && (
                <div onClick={closeMobileMenu}>
                  <NavBar to="/register">
                    Registrarme
                  </NavBar>
                </div>
              )}
              {(path === "/" ||
                path === "/register" ||
                path.startsWith("/auction/specific/")) && (
                <div onClick={closeMobileMenu}>
                  <NavBar to="/login">
                    Iniciar Sesión
                  </NavBar>
                </div>
              )}
            </>
          ) : (
            <UserMenu className="px-4 py-2 relative z-40" />
          )}
        </div>
      )}
    </header>
  );
}
