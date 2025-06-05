import { NavLink } from "react-router";

interface ButtonProps {
    to: string;                // URL de destino
    onClick?: () => void;      // Evento opcional al hacer clic
    children: React.ReactNode; // Texto o contenido del botón
}

export default function DynamicButton({ to, onClick, children }: ButtonProps) {
    return (
        <NavLink to={to} end={true} onClick={onClick} className="button-link">
            {children}
        </NavLink>
    );
}