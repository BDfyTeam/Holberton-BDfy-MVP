import { Search } from "lucide-react";
import categorys from "~/services/categorys";


type Props = {
  className?: string;
};

export default function FiltersIcons({ className }: Props) {
  return (
    <div className={className}>
      {categorys.map((category) => (
        <div
          key={category.id}
          className="flex flex-col items-center justify-center p-1"
        >
          <div 
            className="w-16 h-16 flex items-center justify-center border-3 border-[#0D4F61] 
            rounded-full bg-transparent text-[#0D4F61] hover:border-[#0D4F61] hover:text-[#D3E3EB] 
            hover:bg-[#0D4F61] transition-transform duration-300 hover:scale-115"
          >
            {category.icon}
          </div>
          <span className="text-xs text-center text-[#0D4F61] mt-2">{category.name}</span>
        </div>
      ))}
      {/* Icono de búsqueda */}
      <div 
        className="col-span-2 w-95 h-16 mt-1.5 ml-10 flex items-center justify-between p-1 border-3 
        border-[#0D4F61] rounded-full bg-transparent transition-transform duration-300 hover:scale-110" 
      >
        <input
          type="text"
          className="w-full py-1.5 px-4 bg-transparent text-[#0D4F61] placeholder-[#0D4F61] border-none outline-none p-2"
          placeholder="Buscar subastas..."
        />
        <Search size={42} className="text-[#0D4F61]" />
      </div>
    </div>
  );
}
