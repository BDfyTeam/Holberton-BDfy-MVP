import DynamicButton from "~/components/navegationButton";

interface NavBarProps {
  to: string; // URL de destino
  children: React.ReactNode; // Texto o contenido del botón
  className?: string;
}

export function NavBar({ to, children, className }: NavBarProps) {
  return (
    <div>
      <DynamicButton
        to={to}
        className={ className }
      >
        {children}
      </DynamicButton>
    </div>
  );
}
