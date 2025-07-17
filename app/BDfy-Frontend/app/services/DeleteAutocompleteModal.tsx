import { forwardRef } from "react";

type CustomInputProps = {
  value?: string;
  onClick?: () => void;
  id?: string;
};

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ value, onClick, id }, ref) => (
    <input
      ref={ref}
      id={id}
      type="text"
      readOnly
      onClick={onClick}
      value={value}
      autoComplete="off"
      placeholder=" "
      className="peer w-full px-4 py-2 bg-[#D3E3EB] border-b-2 border-[#0D4F61] focus:outline-none 
        focus:border-[#41c4ae] text-[#0D4F61] text-sm placeholder-transparent transition-all"
    />
  )
);
