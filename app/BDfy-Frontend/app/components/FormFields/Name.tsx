type NameProps = {
  className?: string;
  firstName: string;
  lastName: string;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
};

export default function Name({
  className,
  firstName,
  lastName,
  setFirstName,
  setLastName,
}: NameProps) {
  return (
    <div className={className}>
      <div className="w-1/2 mr-5 relative">
        <input
          type="text"
          id="userFirstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder=" "
          required
          className="w-full p-2 bg-[#D3E3EB] border-b-2 border-[#0D4F61] focus:outline-none 
            focus:border-b-2 focus:border-[#41c4ae] peer autofill:bg-[#D3E3EB] 
            autofill:text-[#0D4F61] autofill:border-[#0D4F61] transition-all 
            peer-placeholder-shown:border-[#0D4F61]"
        />
        <label
          htmlFor="userFirstName"
          className="absolute left-3 top-2 text-[#0D4F61] text-lg transition-all 
            peer-placeholder-shown:top-2 peer-placeholder-shown:text-[#8a8989] 
            peer-focus:top-[-12px] peer-focus:text-[#41c4ae] peer-focus:text-xs 
            peer-not-placeholder-shown:top-[-12px] peer-not-placeholder-shown:text-[#0D4F61] 
            peer-not-placeholder-shown:text-xs"
        >
          Nombre
        </label>
      </div>

      {/* Apellido */}
      <div className="w-1/2 relative">
        <input
          type="text"
          id="userLastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder=" "
          required
          className="w-full p-2 bg-[#D3E3EB] border-b-2 border-[#0D4F61] focus:outline-none 
            focus:border-b-2 focus:border-[#41c4ae] peer autofill:bg-[#D3E3EB] 
          autofill:text-[#0D4F61] autofill:border-[#0D4F61] transition-all 
          peer-placeholder-shown:border-[#0D4F61]"
        />
        <label
          htmlFor="userLastName"
          className="absolute left-3 top-2 text-[#0D4F61] text-lg transition-all 
            peer-placeholder-shown:top-2 peer-placeholder-shown:text-[#8a8989] 
            peer-focus:top-[-12px] peer-focus:text-[#41c4ae] peer-focus:text-xs 
            peer-not-placeholder-shown:top-[-12px] peer-not-placeholder-shown:text-[#0D4F61] 
            peer-not-placeholder-shown:text-xs"
        >
          Apellido
        </label>
      </div>
    </div>
  );
}
