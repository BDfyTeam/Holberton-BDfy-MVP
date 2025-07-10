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
            id="Street"
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
            htmlFor="Street"
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
            id="StreetNumber"
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
            htmlFor="StreetNumber"
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
            id="Corner"
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
            htmlFor="Corner"
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
        <div className="flex w-1/3 relative">
          <input
            type="text"
            id="ZipCode"
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
            htmlFor="ZipCode"
            className="absolute left-3 top-2 text-[#0D4F61] text-lg transition-all 
              peer-placeholder-shown:top-2 peer-placeholder-shown:text-[#8a8989] 
              peer-focus:top-[-12px] peer-focus:text-[#41c4ae] peer-focus:text-xs 
              peer-not-placeholder-shown:top-[-12px] peer-not-placeholder-shown:text-[#0D4F61] 
              peer-not-placeholder-shown:text-xs"
          >
            Código postal
          </label>
        </div>
        <div className="relative z-0 w-2/3 group md:col-span-2">
          <select
            id="department"
            name="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
            className="peer w-full p-2 bg-[#D3E3EB] border-b-2 border-[#0D4F61] focus:outline-none 
            focus:border-[#41c4ae] text-[#0D4F61] placeholder-transparent transition-all 
            peer-placeholder-shown:border-[#0D4F61]"
          >
            <option value="" disabled hidden></option>
            <option value="Artigas">Artigas</option>
            <option value="Canelones">Canelones</option>
            <option value="Cerro Largo">Cerro Largo</option>
            <option value="Colonia">Colonia</option>
            <option value="Durazno">Durazno</option>
            <option value="Flores">Flores</option>
            <option value="Florida">Florida</option>
            <option value="Lavalleja">Lavalleja</option>
            <option value="Maldonado">Maldonado</option>
            <option value="Montevideo">Montevideo</option>
            <option value="Paysandú">Paysandú</option>
            <option value="Río Negro">Río Negro</option>
            <option value="Rivera">Rivera</option>
            <option value="Rocha">Rocha</option>
            <option value="Salto">Salto</option>
            <option value="San José">San José</option>
            <option value="Soriano">Soriano</option>
            <option value="Tacuarembó">Tacuarembó</option>
            <option value="Treinta y Tres">Treinta y Tres</option>
          </select>

          <label
            htmlFor="department"
            className={`absolute left-3 text-[#0D4F61] transition-all duration-200 bg-[#D3E3EB] px-1
              ${department === ""
                ? "top-2 text-lg text-[#8a8989]"
                : "-top-3 text-xs text-[#0D4F61]"}
            `}
          >
            Departamento
          </label>
        </div>
      </div>
    </div>
  );
}
