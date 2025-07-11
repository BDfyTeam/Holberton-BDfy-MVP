import { useLocation } from "react-router-dom";
import { NavBar } from "./navBar";
import DynamicButton from "./navegationButton";
import UserMenu from "./UserMenu";
import { useAuth } from "~/context/authContext";
import { Gavel } from "lucide-react";
import ComonMenu from "./comonMenu";


interface Props {
  className?: string;
}

export default function Header({ className }: Props) {
  const { isAuthenticated, logout } = useAuth();

  const location = useLocation();
  const path = location.pathname;

  return (
    <header
      className={className}
      style={{
        background:
          "linear-gradient(180deg, #0D4F61 0%, rgba(255, 255, 255, 0) 81%)",
      }}
    >
      {/* Izquierda: menú y logo */}
      <div className="flex space-x-6 mt-1">
        {/* <ComonMenu /> */}

        <div className="flex space-x-4 group">
          <DynamicButton
            to="/"
            className="w-15 h-15 flex items-center justify-center rounded-full bg-[#147894] group-hover:drop-shadow-[0_0_6px_#ffffff] transition duration-300"
          >
            <Gavel className="w-10 h-10 transition-transform duration-300 group-hover:rotate-30" />
          </DynamicButton>

          <DynamicButton
            to="/"
            className="text-3xl mt-3 font-extrabold tracking-wide group-hover:drop-shadow-[0_0_6px_#ffffff] transition duration-300"
          >
            BDfy
          </DynamicButton>
        </div>
      </div>

      {/* Derecha: Menús según autenticación */}
      <div className="flex space-x-6 ">
        <NavBar to="/abaut" className="flex px-4 py-2 mt-4 hover:drop-shadow-[0_0_6px_#ffffff] hover:text-[#ffffff] transition duration-300 font-semibold">Sobre nosotros</NavBar>
        <NavBar to="/gallery" className="flex mt-4 px-4 py-2 hover:drop-shadow-[0_0_6px_#ffffff] hover:text-[#ffffff] transition duration-300 font-semibold">Subastas</NavBar>
        <NavBar to="/help" className="flex mt-4 px-4 py-2 hover:drop-shadow-[0_0_6px_#ffffff] hover:text-[#ffffff] transition duration-300 font-semibold">Ayuda</NavBar>
        <NavBar to="/contact" className="flex mt-4 px-4 py-2 hover:drop-shadow-[0_0_6px_#ffffff] hover:text-[#ffffff] transition duration-300 font-semibold">Contacto</NavBar>

        {!isAuthenticated ? (
          <div className="hidden md:flex space-x-4">
            {(path === "/" || path === "/login") && (
              <NavBar 
                to="/register"
                className="flex mt-4 px-4 py-2 rounded-full border-2 border-grey-200 bg-transparent hover:drop-shadow-[0_0_6px_#ffffff] hover:text-[#ffffff] transition duration-300 font-semibold"
              >
                Registrarme
              </NavBar>
            )}
            {(path === "/" || path === "/register") && (
              <NavBar 
                to="/login"
                className="flex mt-4 px-4 py-2 rounded-full border-2 border-grey-200 bg-transparent hover:drop-shadow-[0_0_6px_#ffffff] hover:text-[#ffffff] transition duration-300 font-semibold"
              >
                Iniciar Sesión
              </NavBar>
            )}
          </div>
        ) : (
          <UserMenu className="flex mt-1 px-4 py-2 relative z-40" />
        )}
      </div>
    </header>
  );
}
