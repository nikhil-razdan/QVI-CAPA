import Header from "../components/Header.tsx"
import CardGrid from "../components/CardGrid.tsx"

const Dashboard = () => {
  return (
    <div className="qms-gradient-bg p-10">
      <div className="w-full">
        <Header />
        <CardGrid />
      </div>
    </div>
  )
}

export default Dashboard
