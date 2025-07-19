type EmailProps = {
  email: string;
  setEmail: (email: string) => void;
  className?: string;
}


export default function Email({ email, setEmail, className }: EmailProps) {
  return (
    <div className={className}>
      <input
        type="email"
        id="userEmail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder=" "
        required
        className="w-full p-2 bg-[#D3E3EB] border-b-2 border-[#0D4F61] focus:outline-none 
            focus:border-b-2 focus:border-[#41c4ae] peer autofill:bg-[#D3E3EB] 
            autofill:text-[#0D4F61] autofill:border-[#0D4F61] transition-all 
            peer-placeholder-shown:border-[#0D4F61]"
      />
      <label
        htmlFor="userEmail"
        className="absolute left-3 top-2 text-[#0D4F61] text-lg transition-all 
          peer-placeholder-shown:top-2 peer-placeholder-shown:text-[#8a8989] 
          peer-focus:top-[-12px] peer-focus:text-[#41c4ae] peer-focus:text-xs 
          peer-not-placeholder-shown:top-[-12px] peer-not-placeholder-shown:text-[#0D4F61] 
          peer-not-placeholder-shown:text-xs"
    >
        Email
      </label>
    </div>
  );
}
