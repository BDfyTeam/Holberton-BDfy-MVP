// todo: este componente se tiene que ir a la mierda cuando ande el otro galery de lotes.
import type { BasicCardItem } from "~/services/types";

type CardProps = {
  items: BasicCardItem[];
  onCardClick?: (item: BasicCardItem) => void;
  className?: string;
};

export default function GaleryOfLotCards({ items, className, onCardClick }: CardProps) {
  return (
    <div className={className}>
      {items.map((item) => (
        <div 
          key={item.id} 
          onClick={() => onCardClick?.(item)}
          className="bg-white text-black p-4 rounded-lg shadow space-y-2 w-full flex flex-col justify-between transform transition-transform duration-300 hover:scale-105"
        >
          <h2 className="font-semibold text-lg">{item.title}</h2>
          <p className="text-sm text-gray-600">{item.description}</p>
          <p>{item.category}</p>
        </div>
      ))}
    </div>
  );
}
