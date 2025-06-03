type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "submit" | "button";
};

export default function Button({
    children,
    onClick,
    type = "button",
    }: ButtonProps) {
    return (
        <button
        type={type}
        onClick={onClick}
        className="w-full bg-[rgb(28,148,180)] text-white py-2 rounded-md font-bold hover:bg-opacity-90 transition"
        >
        {children}
        </button>
    );
}