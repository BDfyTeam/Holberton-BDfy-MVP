import { useState } from "react";
import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  onSearch?: (value: string) => void;
  className?: string;
  placeHolder?: string;
}

export default function SearchBar({ onSearch, className = "", placeHolder="" }: SearchBarProps) {
  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    if (onSearch) onSearch(value);
  };

  return (
    <div className={`${className}`}>
      <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-blue-400" />
      <input
        type="text"
        placeholder={`${placeHolder}`}
        value={input}
        onChange={handleInputChange}
        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 bg-white/90 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
      />
    </div>
  );
}
