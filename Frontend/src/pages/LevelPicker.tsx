import { useNavigate, useParams } from "react-router-dom";
import { getZohoFormConfig } from "../config/zohoFormConfig";

const LEVEL_OPTIONS = [1, 2, 3];

const LevelPicker = () => {
  const navigate = useNavigate();
  const { formId } = useParams();

  const handleClick = (level: number, available: boolean) => {
    if (!available) return;
    navigate(`/audit-management/form-master/${formId}/level/${level}`);
  };

  return (
    <div className="qms-gradient-bg min-h-screen p-10">
      <div className="w-full">
        <div className="relative mb-12">
          <button
            onClick={() => navigate("/audit-management/form-master")}
            className="absolute left-0 top-0 bg-gray-800 hover:bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm transition"
          >
            &larr; Back
          </button>
          <h1 className="text-center text-4xl font-bold text-white">Select Level</h1>
          <p className="absolute right-0 top-2 text-xs text-white/85 font-medium">QMS Veritas India</p>
        </div>
        <div className="flex justify-center gap-8 flex-wrap">
          {LEVEL_OPTIONS.map(level => {
            const available = !!getZohoFormConfig(formId ?? "", level);
            return (
              <div
                key={level}
                onClick={() => handleClick(level, available)}
                className={`rounded-2xl shadow-md h-36 w-48 flex flex-col items-center justify-center p-4 transition-all ${
                  available ? "bg-[#e8c86d] cursor-pointer hover:shadow-lg hover:scale-105" : "bg-[#e8c86d]/40 cursor-not-allowed"
                }`}
              >
                <span className={`font-bold text-sm ${available ? "text-gray-900" : "text-gray-400"}`}>Level {level}</span>
                {!available && <span className="text-xs text-gray-400 mt-1">Coming soon</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelPicker;
