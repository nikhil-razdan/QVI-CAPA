import DashboardCard from "./DashboardCard.tsx"
import {cards} from "../data/cards.ts"
const CardGrid = () => {
  return (
    <div
    className="
      grid
      grid-cols-1
      sm:grid-cols-2
      md:grid-cols-3
      lg:grid-cols-5
      gap-8
      ">
      {cards.map((card) => (
      <DashboardCard key={card.id} card={card}></DashboardCard>
      ))}
    </div>
  )
}

export default CardGrid
