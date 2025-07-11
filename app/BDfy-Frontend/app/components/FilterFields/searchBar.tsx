import { useState } from "react";
import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  onSearch?: (value: string) => void;
  className?: string;
  placeHolder?: string;
  classNameInput?: string;
  classNameIcon?: string;
}

export default function SearchBar({ onSearch, className = "", placeHolder="", classNameInput="", classNameIcon="" }: SearchBarProps) {
  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    if (onSearch) onSearch(value);
  };

  return (
    <div className={`relative ${className}`}>
      <FaSearch className={`${classNameIcon}`}/>
      <input
        type="text"
        placeholder={`${placeHolder}`}
        value={input}
        onChange={handleInputChange}
        className={`${classNameInput}`}
      />
    </div>
  );
}
