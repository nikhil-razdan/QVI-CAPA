import { useNavigate } from "react-router-dom";
import type { CardData } from "../types/card.ts";

interface DashboardCardProps {
  card: CardData;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ card }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (card.path) {
      navigate(card.path);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="
        bg-[#e8c86d]
        rounded-2xl
        shadow-md
        h-24
        flex
        items-center
        justify-center
        cursor-pointer
        hover:shadow-lg
        hover:scale-105
        transition-all
        p-4"
    >
      {card?.title && (
        <span className="font-semibold text-gray-800 text-center text-sm">
          {card.title}
        </span>
      )}
    </div>
  );
};

export default DashboardCard;
