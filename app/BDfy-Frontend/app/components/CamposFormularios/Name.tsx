type NameProps = {
  className?: string;
  firstName: string;
  lastName: string;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
};

export default function Name({ className, firstName, lastName, setFirstName, setLastName }: NameProps) {
  return (
    <div className={className}>
      <div className="Nombre">
        <input
          type="text"
          id="userFirstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Nombre"
          required
          className="peer block w-1/4 appearance-none rounded-lg border
                    bg-[#0D4F61] px-4 pt-5 pb-2 text-sm text-white 
                    placeholder-transparentfocus:border-[#81fff9] focus:outline-none 
                    focus:ring-2 focus:ring-[#81fff9]/50 transition"
        />
        <label
          htmlFor="userFirstName"
          className="absolute left-4 -top-3 z-10 text-sm text-[#81fff9] 
                px-1 transition-all duration-200 peer-placeholder-shown:top-3 
                peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]
                bg-[#0D4F61]"
        >
          Nombre
        </label>
      </div>
      {/* Apellido */}
      <div className="Apellido">
        <input
          type="text"
          id="userLastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Apellido"
          required
          className="peer block w-1/4 appearance-none rounded-lg border
                    bg-[#0D4F61] px-4 pt-5 pb-2 text-sm text-white 
                    placeholder-transparentfocus:border-[#81fff9] focus:outline-none 
                    focus:ring-2 focus:ring-[#81fff9]/50 transition"
        />
        <label
          htmlFor="userLastName"
          className="absolute left-4 -top-3 z-10 text-sm text-[#81fff9] 
              px-1 transition-all duration-200 peer-placeholder-shown:top-3 
              peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]
                bg-[#0D4F61]"
        >
          Apellido
        </label>
      </div>
    </div>
  );
}
