type DocumentProps = {
  documentNumber: string;
  setDocumentNumber: (value: string) => void;
}

export default function Document({ documentNumber, setDocumentNumber }: DocumentProps) {
  return (
    <>
      <input
        type="text"
        id="userDocumentNumber"
        value={documentNumber}
        onChange={(e) => setDocumentNumber(e.target.value)}
        placeholder="Número de documento"
        required
        className="peer block w-1/4 appearance-none rounded-lg border
                    bg-[#0D4F61] px-4 pt-5 pb-2 text-sm text-white 
                    placeholder-transparentfocus:border-[#81fff9] focus:outline-none 
                    focus:ring-2 focus:ring-[#81fff9]/50 transition"
      />
      <label
        htmlFor="userDocumentNumber"
        className="absolute left-4 -top-3 z-10 text-sm text-[#81fff9] 
                px-1 transition-all duration-200 peer-placeholder-shown:top-3 
                peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]
                bg-[#0D4F61]"
      >
        Número de documento
      </label>
    </>
  );
}
