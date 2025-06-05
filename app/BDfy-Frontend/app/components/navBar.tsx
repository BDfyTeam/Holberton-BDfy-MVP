import DynamicButton from "~/components/navegationButton";

interface NavBarProps {
    to: string;                // URL de destino
    children: React.ReactNode; // Texto o contenido del botón
}

export function NavBar({to, children}: NavBarProps) {
    return (
      <div>
        <DynamicButton to={to}>
            {children}
        </DynamicButton>
      </div>
    );
  }
  