import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative mb-12">
      <p className="absolute left-0 top-2 text-xs text-white/80">QMS Veritas India</p>
      <h1 className="text-center text-4xl font-bold text-white">QMS Management Portal</h1>
      <button 
        onClick={handleLogout}
        className="
          absolute
          right-0
          top-0
          bg-gray-800
          hover:bg-gray-900
          text-white
          px-4
          py-1
          rounded-full
          transition"
      >
        Logout
      </button>
    </div>
  )
}

export default Header
