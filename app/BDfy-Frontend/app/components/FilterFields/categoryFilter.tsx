import { useState } from "react";
import categorys from "~/services/categorys";

type Props = {
  className?: string;
  onCategoryChange: (categoryId: number | null) => void;
  currentCategory: number | null;
  setIsCategorySelected: (isSelected: boolean) => void;
};

export default function CategoryFilter({
  className,
  onCategoryChange,
  currentCategory,
  setIsCategorySelected,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  function handleCategoryClick(categoryId: number) {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      setIsCategorySelected(false);
      onCategoryChange(null);
    } else {
      setSelectedCategory(categoryId);
      setIsCategorySelected(true);
      onCategoryChange(categoryId);
    }
  }

  const displayedCategories = showAll ? categorys : categorys.slice(0, 4); // Slice para mostrar 4 y despues todas

  return (
    <div className="flex flex-col space-y-2">
      <div className={`grid ${className}`}>
        {displayedCategories.map((category) => (
          <div
            key={category.id}
            className="flex flex-col items-center justify-center p-1 cursor-pointer"
            onClick={() => handleCategoryClick(category.id)}
          >
            <div
              className={`
                w-16 h-16 flex items-center justify-center border-3 rounded-full
                ${
                  selectedCategory === category.id
                    ? "bg-[#0D4F61] text-[#D3E3EB] scale-115 border-[#0D4F61]"
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

      {/* Boton para mostrar mas */}
      <button
        onClick={() => setShowAll(!showAll)}
        className="mt-2 text-sm text-blue-600 hover:underline self-center"
      >
        {showAll ? "Mostrar menos" : "Mostrar más"}
      </button>
    </div>
  );
}
