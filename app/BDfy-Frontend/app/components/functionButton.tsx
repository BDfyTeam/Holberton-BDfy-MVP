type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "submit" | "button";
  disabled?: boolean;
};

export default function Button({
  children,
  onClick,
  type = "button",
  disabled = false
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-2 rounded-md font-bold text-white transition duration-500 transform ${disabled
        ? "bg-[rgb(28,148,180)] opacity-50 cursor-not-allowed"
        : "bg-[rgb(28,148,180)] over:bg-[rgb(22,120,150)] hover:scale-105"
        }`}
    >
      {children}
    </button>
  );
}