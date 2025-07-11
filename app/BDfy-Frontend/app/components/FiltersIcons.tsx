import { Search } from "lucide-react";
import { useState } from "react";
import categorys from "~/services/categorys";
import { getAuctionsByCategory } from "~/services/fetchService";
import type { Auction } from "~/services/types";

type Props = {
  className?: string;
  setAuction: (auction: Auction[]) => void;
  setIsCategorySelected: (isSelected: boolean) => void;
};

export default function FiltersIcons({
  className,
  setAuction,
  setIsCategorySelected,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  async function handleCategoryClick(categoryId: number) {
    try {
      const auctions = await getAuctionsByCategory(categoryId);
      setAuction(auctions);

      if (selectedCategory === categoryId) {
        setSelectedCategory(null);
        setIsCategorySelected(false);
      } else {
        setSelectedCategory(categoryId);
        setIsCategorySelected(true);
      }
    } catch (err) {
      console.error("Error obteniendo subastas por categoria.", err);
      setAuction([]);
    }
  }

  return (
    <>
      <div className={className}>
        {categorys.map((category) => (
          <div
            key={category.id}
            className="flex flex-col items-center justify-center p-1"
            onClick={() => handleCategoryClick(category.id)}
          >
            <div
              className={`
              w-16 h-16 flex items-center justify-center border-3 rounded-full
              ${
                selectedCategory === category.id
                  ? "bg-[#0D4F61] text-[#D3E3EB] scale-115 border-3 border-[#0D4F61]"
                  : "border-[#0D4F61] bg-transparent text-[#0D4F61]"
              }
              hover:border-[#0D4F61] hover:text-[#D3E3EB] hover:bg-[#0D4F61] transition-transform duration-300 hover:scale-115
              `}
            >
              {category.icon}
            </div>
            <span className="text-xs text-center text-[#0D4F61] mt-2">
              {category.name}
            </span>
          </div>
        ))}
      </div>
      {/* Icono de búsqueda */}
      <div
        className="w-5/8 h-16 mt-4 ml-67 flex text-center items-center justify-between p-1 border-3 
        border-[#0D4F61] rounded-full bg-transparent transition-transform duration-300 hover:scale-110"
      >
        <input
          type="text"
          className="w-full py-1.5 px-4 bg-transparent text-[#0D4F61] placeholder-[#0D4F61] border-none outline-none p-2"
          placeholder="Buscar subastas..."
        />
        <Search size={42} className="text-[#0D4F61]" />
      </div>
    </>
  );
}
