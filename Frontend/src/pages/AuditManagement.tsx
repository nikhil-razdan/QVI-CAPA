import { useNavigate } from "react-router-dom";

const options = [
  { title: "Form Master", subtitle: "Access and fill audit forms", path: "/audit-management/form-master" },
  { title: "Company Master", subtitle: "Add and manage companies", path: "/audit-management/company-master" },
  { title: "Auditor Master", subtitle: "Add and manage auditors", path: "/audit-management/auditor-master" },
  { title: "Create Audit", subtitle: "Schedule and route new audits", path: "/audit-management/create-audit" },
];

const AuditManagement = () => {
  const navigate = useNavigate();

  return (
    <div className="qms-gradient-bg min-h-screen p-10">
      <div className="w-full">
        <div className="relative mb-12">
          <button
            onClick={() => navigate("/dashboard")}
            className="absolute left-0 top-0 bg-gray-800 hover:bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm transition"
          >
            &larr; Back to Dashboard
          </button>
          <h1 className="text-center text-4xl font-bold text-white">Audit Management</h1>
          <p className="absolute right-0 top-2 text-xs text-white/85 font-medium">QMS Veritas India</p>
        </div>
        <div className="flex justify-center gap-8 flex-wrap">
          {options.map(opt => (
            <div
              key={opt.title}
              onClick={() => navigate(opt.path)}
              className="bg-[#e8c86d] rounded-2xl shadow-md h-36 w-56 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all p-4"
            >
              <span className="font-bold text-gray-900 text-sm mb-1">{opt.title}</span>
              <span className="font-medium text-gray-700 text-xs text-center">{opt.subtitle}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuditManagement;
