import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PasswordProps = {
  password: string;
  setPassword: (password: string) => void;
  classNames?: string;
};

export default function Password({
  password,
  setPassword,
  classNames,
}: PasswordProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={classNames}>
      <input
        type={showPassword ? "text" : "password"}
        id="userPassword"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder=" "
        required
        className="w-full p-2 bg-[#D3E3EB] border-b-2 border-[#0D4F61] focus:outline-none 
              focus:border-b-2 focus:border-[#41c4ae] peer autofill:bg-[#D3E3EB] 
              autofill:text-[#0D4F61] autofill:border-[#0D4F61] transition-all 
              peer-placeholder-shown:border-[#0D4F61]"
      />
      <label
        htmlFor="userPassword"
        className="absolute left-3 top-2 text-[#0D4F61] text-lg transition-all 
              peer-placeholder-shown:top-2 peer-placeholder-shown:text-[#8a8989] 
              peer-focus:top-[-12px] peer-focus:text-[#41c4ae] peer-focus:text-xs 
              peer-not-placeholder-shown:top-[-12px] peer-not-placeholder-shown:text-[#0D4F61] 
              peer-not-placeholder-shown:text-xs"
      >
        Contraseña
      </label>
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0D4F61]/65 hover:text-[#0D4F61]"
        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {showPassword ? (
          <EyeOff className="h-7 w-7" />
        ) : (
          <Eye className="h-7 w-7" />
        )}
      </button>
    </div>
  );
}
