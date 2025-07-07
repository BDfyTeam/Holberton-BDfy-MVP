type DirectionProps = {
  className?: string;
  street: string;
  streetNumber: string;
  corner: string;
  zipCode: string;
  department: string;
  setStreet: (value: string) => void;
  setStreetNumber: (value: string) => void;
  setCorner: (value: string) => void;
  setZipCode: (value: string) => void;
  setDepartment: (value: string) => void;
};

export default function Direction({
  className,
  street,
  streetNumber,
  corner,
  zipCode,
  department,
  setStreet,
  setStreetNumber,
  setCorner,
  setZipCode,
  setDepartment,
}: DirectionProps) {
  return (
    <div className={className}>
      {/* bloque superior */}
      <div className="flex gap-4 mb-4">
        {/* calle */}
        <div className="flex w-2/5 relative">
          <input
            type="text"
            id="userStreet"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder=" "
            required
            className="w-full p-2 bg-[#D3E3EB] border-b-2 border-[#0D4F61] focus:outline-none 
              focus:border-b-2 focus:border-[#41c4ae] peer autofill:bg-[#D3E3EB] 
              autofill:text-[#0D4F61] autofill:border-[#0D4F61] transition-all 
              peer-placeholder-shown:border-[#0D4F61]"
          />
          <label 
            htmlFor="userStreet" 
            className="absolute left-3 top-2 text-[#0D4F61] text-lg transition-all 
              peer-placeholder-shown:top-2 peer-placeholder-shown:text-[#8a8989] 
              peer-focus:top-[-12px] peer-focus:text-[#41c4ae] peer-focus:text-xs 
              peer-not-placeholder-shown:top-[-12px] peer-not-placeholder-shown:text-[#0D4F61] 
              peer-not-placeholder-shown:text-xs"
          >
            Calle
          </label>
        </div>
        {/* Numero de calle */}
        <div className="flex w-1/5 relative">
          <input
            type="text"
            id="userStreetNumber"
            value={streetNumber}
            onChange={(e) => setStreetNumber(e.target.value)}
            placeholder=" "
            required
            className="w-full p-2 bg-[#D3E3EB] border-b-2 border-[#0D4F61] focus:outline-none 
              focus:border-b-2 focus:border-[#41c4ae] peer autofill:bg-[#D3E3EB] 
              autofill:text-[#0D4F61] autofill:border-[#0D4F61] transition-all 
              peer-placeholder-shown:border-[#0D4F61]"
          />
          <label 
            htmlFor="userStreetNumber" 
            className="absolute left-2 top-2 text-[#0D4F61] text-lg transition-all 
              peer-placeholder-shown:top-2 peer-placeholder-shown:text-[#8a8989] 
              peer-focus:top-[-12px] peer-focus:text-[#41c4ae] peer-focus:text-xs 
              peer-not-placeholder-shown:top-[-12px] peer-not-placeholder-shown:text-[#0D4F61] 
              peer-not-placeholder-shown:text-xs"
          >
            N° calle
          </label>
        </div>
        {/* Esquina */}
        <div className="flex w-2/5 relative">
          <input
            type="text"
            id="userCorner"
            value={corner}
            onChange={(e) => setCorner(e.target.value)}
            placeholder=" "
            required
            className="w-full p-2 bg-[#D3E3EB] border-b-2 border-[#0D4F61] focus:outline-none 
              focus:border-b-2 focus:border-[#41c4ae] peer autofill:bg-[#D3E3EB] 
              autofill:text-[#0D4F61] autofill:border-[#0D4F61] transition-all 
              peer-placeholder-shown:border-[#0D4F61]"
          />
          <label 
            htmlFor="userCorner" 
            className="absolute left-3 top-2 text-[#0D4F61] text-lg transition-all 
              peer-placeholder-shown:top-2 peer-placeholder-shown:text-[#8a8989] 
              peer-focus:top-[-12px] peer-focus:text-[#41c4ae] peer-focus:text-xs 
              peer-not-placeholder-shown:top-[-12px] peer-not-placeholder-shown:text-[#0D4F61] 
              peer-not-placeholder-shown:text-xs"
          >
            Esquina
          </label>
        </div>
      </div>
      {/* Bloque inferior */}
      <div className="flex gap-4">
        <div className="flex w-1/2 relative">
          <input
            type="text"
            id="userZipCode"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder=" "
            required
            className="w-full p-2 bg-[#D3E3EB] border-b-2 border-[#0D4F61] focus:outline-none 
              focus:border-b-2 focus:border-[#41c4ae] peer autofill:bg-[#D3E3EB] 
              autofill:text-[#0D4F61] autofill:border-[#0D4F61] transition-all 
              peer-placeholder-shown:border-[#0D4F61]"
          />
          <label 
            htmlFor="userZipCode" 
            className="absolute left-3 top-2 text-[#0D4F61] text-lg transition-all 
              peer-placeholder-shown:top-2 peer-placeholder-shown:text-[#8a8989] 
              peer-focus:top-[-12px] peer-focus:text-[#41c4ae] peer-focus:text-xs 
              peer-not-placeholder-shown:top-[-12px] peer-not-placeholder-shown:text-[#0D4F61] 
              peer-not-placeholder-shown:text-xs"
            >
            Código postal
          </label>
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            id="userDepartment"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder=" "
            required
            className="w-full p-2 bg-[#D3E3EB] border-b-2 border-[#0D4F61] focus:outline-none 
              focus:border-b-2 focus:border-[#41c4ae] peer autofill:bg-[#D3E3EB] 
              autofill:text-[#0D4F61] autofill:border-[#0D4F61] transition-all 
              peer-placeholder-shown:border-[#0D4F61]"
          />
          <label 
            htmlFor="userDepartment" 
            className="absolute left-3 top-2 text-[#0D4F61] text-lg transition-all 
              peer-placeholder-shown:top-2 peer-placeholder-shown:text-[#8a8989] 
              peer-focus:top-[-12px] peer-focus:text-[#41c4ae] peer-focus:text-xs 
              peer-not-placeholder-shown:top-[-12px] peer-not-placeholder-shown:text-[#0D4F61] 
              peer-not-placeholder-shown:text-xs"
            >
            Departamento
          </label>
        </div>
      </div>
    </div>
  );
}
