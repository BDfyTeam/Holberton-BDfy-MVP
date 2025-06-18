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
        className={`px-4 py-2 rounded-full border-2 border-[#59b9e2] text-[#59b9e2] bg-transparent hover:bg-[#6cf2ff] hover:text-[#1b3845] transition duration-300 font-semibold 
          ${ className ?? "" }`}
      >
        {children}
      </DynamicButton>
    </div>
  );
}
