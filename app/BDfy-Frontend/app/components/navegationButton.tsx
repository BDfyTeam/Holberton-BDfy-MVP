import { NavLink } from "react-router";

interface ButtonProps {
  to: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function DynamicButton({ to, onClick, children, className }: ButtonProps) {
  return (
    <NavLink to={to} end={true} onClick={onClick} className={`button-link ${className ?? ''}`}>
      {children}
    </NavLink>
  );
}
