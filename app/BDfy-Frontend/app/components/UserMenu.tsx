import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { User, Gavel, Trophy, Boxes, Bell, User2, LogOut } from "lucide-react";
import { fetchRole } from "~/services/fetchService";
import { useAuth } from "~/context/authContext";
import { getUserById } from "~/services/fetchService";
import { getUserIdFromToken } from "~/services/handleToken";
import { createPortal } from "react-dom";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [isClient, setIsClient] = useState(false); // 👈 nuevo
  const [role, setRole] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    setIsClient(true); // 👈 asegura que esto solo pasa en el cliente

    const fetchUserRole = async () => {
      try {
        const data = await fetchRole();

        if (data) {
          setRole(data.role);
        }
      } catch (error) {
        console.error("Error al obtener el rol del usuario:", error);
      }
    };

    const fetchUserInfo = async () => {
      const userId = getUserIdFromToken();
      if (!userId) {
        console.error("User ID is null");
        return;
      }

      try {
        const userData = await getUserById(userId);
        setUser(userData);
      } catch (err) {
        console.error("Error al obtener datos del usuario", err);
      }
    };

    fetchUserRole();
    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isClient) return null; // 👈 evita renderizar en SSR

  return (
    <div className="relative z-40">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-12 h-12 rounded-full bg-[#59b9e2] text-white font-bold text-2xl flex items-center justify-center hover:drop-shadow-[0_0_6px_#59b9e2] transition duration-300"
      >
        {user ? user.firstName.charAt(0).toUpperCase() : "U"}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl text-sm z-80 ">
          {/* Cabecera del menú */}
          <div className="bg-[#1B3845] text-[#81fff9] p-4 rounded-t-lg border-b border-[#59b9e2]/40 shadow-sm">
            <div className="font-bold text-lg leading-tight">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-xs text-[#81fff9]/70">{user.email}</div>
          </div>

          {/* Lista de opciones */}
          <ul className="divide-y divide-[#59b9e2]/20 text-[#1B3845]">
            <MenuItem icon={<User size={18} />} text="Mi Perfil" />
            {role === 1 && (
              <>
                <MenuItem
                  icon={<Gavel size={18} />}
                  text="Mis Subastas"
                  onClick={() => navigate("/my-auctions")}
                />
                <MenuItem icon={<Boxes size={18} />} text="Inventario" />
              </>
            )}
            {role === 0 && (
              <MenuItem icon={<Trophy size={18} />} text="Subastas Ganadas" />
            )}
            <MenuItem
              icon={<Bell size={18} />}
              text="Notificaciones"
              badge={3}
            />
            <MenuItem
              icon={<LogOut size={18} />}
              text="Cerrar sesión"
              onClick={handleLogout}
            />
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
      className="flex items-center justify-between px-4 py-3 hover:bg-[#59b9e2]/10 cursor-pointer transition rounded-md"
    >
      <div className="flex items-center space-x-3">
        {icon}
        <span className="text-sm font-medium">{text}</span>
      </div>
      {badge !== undefined && (
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </li>
  );
}

