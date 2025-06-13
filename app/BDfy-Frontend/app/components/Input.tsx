type InputProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Input({
  label,
  name,
  type = "text",
  placeholder = "",
  value,
  onChange,
}: InputProps) {
  return (
    <label className="block">
      <span className="block text-[rgb(60,63,96)] font-medium mb-1">{label}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(28,148,180)]"
      />
    </label>
  );
}
