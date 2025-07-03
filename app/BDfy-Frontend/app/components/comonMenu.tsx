import { useState } from "react";
import { AlignJustify, Home, Info, HelpCircle, X, Gavel, Settings } from "lucide-react";
import { useNavigate } from "react-router";
import { createPortal } from "react-dom";
import DynamicButton from "./navegationButton";

function MenuItem({
  icon,
  text,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
}) {
  return (
    <li
      onClick={onClick}
      className="flex items-center space-x-3 px-2 py-2 rounded-md cursor-pointer hover:bg-[#2c4d5a] transition-colors"
    >
      {icon}
      <span className="text-sm font-medium">{text}</span>
    </li>
  );
}

export default function ComonMenu({ className }: { className?: string }) {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const openMenu = () => setShowMenu(true);
  const closeMenu = () => setShowMenu(false);

  return (
    <div className={className}>
      <button
        onClick={openMenu}
        className="w-10 h-10 rounded-full text-white flex items-center justify-center hover:bg-white/10 transition"
      >
        <AlignJustify size={24} />
      </button>

      {showMenu &&
        createPortal(
          <>
            {/* Fondo oscuro */}
            <div
              onClick={closeMenu}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Menú lateral */}
            <div className="fixed top-0 left-0 h-screen w-72 bg-[#0D4F61]/80 backdrop-blur-md text-[#81fff9] z-50 shadow-lg flex flex-col pt-4 px-6 pb-6 space-y-4 border-r border-[#59b9e2]/40">
              <button
                onClick={closeMenu}
                className="self-end text-[#81fff9]/80 hover:text-[#81fff9] transition"
              >
                <X size={28} />
              </button>

              <div className="flex items-center space-x-4 group -mt-2">
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

              <hr className="border-t border-[#81fff9]/20 my-2" />

              <ul className="flex flex-col space-y-2 text-lg">
                <MenuItem
                  icon={<Home size={20} />}
                  text="Inicio"
                  onClick={() => {
                    navigate("/");
                    closeMenu();
                  }}
                />
                <MenuItem icon={<Info size={20} />} text="Sobre Nosotros" />
                <MenuItem icon={<HelpCircle size={20} />} text="Ayuda" />
                <MenuItem icon={<Settings size={18} />} text="Configuración" />
              </ul>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
