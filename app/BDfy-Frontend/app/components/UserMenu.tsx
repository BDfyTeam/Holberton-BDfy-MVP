import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Gavel,
  Trophy,
  Boxes,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [isClient, setIsClient] = useState(false); // 👈 nuevo
  const navigate = useNavigate();

  useEffect(() => {
    setIsClient(true); // 👈 asegura que esto solo pasa en el cliente
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!isClient) return null; // 👈 evita renderizar en SSR

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-bold flex items-center justify-center"
      >
        U
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl text-sm z-50">
          {/* Cabecera del menú */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-t-lg">
            <div className="font-bold">Usuario Demo</div>
            <div className="text-xs opacity-80">#12345</div>
          </div>

          {/* Lista de opciones */}
          <ul className="divide-y divide-gray-100 text-gray-700">
            <MenuItem icon={<User size={18} />} text="Mi Perfil" />
            <MenuItem icon={<Gavel size={18} />} text="Mis Subastas" />
            <MenuItem icon={<Trophy size={18} />} text="Subastas Ganadas" />
            <MenuItem icon={<Boxes size={18} />} text="Mis Lotes" />
            <MenuItem icon={<Bell size={18} />} text="Notificaciones" badge={3} />
            <MenuItem icon={<Settings size={18} />} text="Configuración" />
            <MenuItem icon={<LogOut size={18} />} text="Cerrar sesión" onClick={handleLogout} />
          </ul>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  text,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <li
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer"
    >
      <div className="flex items-center space-x-2">
        {icon}
        <span>{text}</span>
      </div>
      {badge !== undefined && (
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </li>
  );
}
