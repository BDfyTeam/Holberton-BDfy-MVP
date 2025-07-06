import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Gavel,
  Trophy,
  Boxes,
  Bell,
  UserRound,
  LogOut,
} from "lucide-react";
import { fetchRole } from "~/services/fetchService";
import { useAuth } from "~/context/authContext";
import { getUserById } from "~/services/fetchService";
import { getUserIdFromToken } from "~/services/handleToken";

interface Props {
  className?: string;
}

export default function UserMenu({ className }: Props) {
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
    <div className={className}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center text-2xl w-13 h-13 rounded-full border-3 border-grey-200 bg-transparent hover:drop-shadow-[0_0_6px_#ffffff] hover:text-[#ffffff] transition duration-300 font-semibold"
      >
        <UserRound className="w-10 h-10" />
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-transparent z-40"
          />

          <div className="absolute right-0 mt-14 w-64 bg-[#E6EFF2] rounded-2xl shadow-xl text-sm z-80">
            {/* Cabecera del menú */}
            <div className="bg-[#0D4F61] text-[#E6EFF2] p-4 rounded-t-2xl border-b border-[#0D4F61]/40 shadow-sm">
              <div className="font-bold text-lg leading-tight">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-[#E6EFF2]/70">{user.email}</div>
            </div>

            {/* Lista de opciones */}
            <ul className="divide-y divide-[#0D4F61]/20 text-[#1B3845]">
              <MenuItem icon={<User size={18} />} text="Mi Perfil" />
              {role === 1 && (
                <>
                  <MenuItem
                    icon={<Gavel size={18} />}
                    text="Mis Subastas"
                    onClick={() => navigate("/my-auctions")}
                  />
                  <MenuItem
                    icon={<Boxes size={18} />}
                    text="Inventario"
                    onClick={() => navigate("/my-lots")}
                  />
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
        </>
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
      className="flex items-center justify-between px-4 py-3 hover:bg-[#0D4F61]/10 cursor-pointer transition rounded-md"
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
