import { useNavigate } from "react-router-dom";

interface FormItem {
  id: number;
  title: string;
  subtitle: string;
}

const formItems: FormItem[] = [
  { id: 1, title: "QMS Audit 01", subtitle: "Quality Management" },
  { id: 2, title: "QMS Audit 02", subtitle: "Product Development" },
  { id: 3, title: "QMS Audit 03", subtitle: "Purchases" },
  { id: 4, title: "QMS Audit 04", subtitle: "Receipt of Raw Materials and Components" },
  { id: 5, title: "QMS Audit 05", subtitle: "Manufacturing" },
  { id: 6, title: "QMS Audit 06", subtitle: "Final Product" },
  { id: 7, title: "QMS Audit 07", subtitle: "Traceability and Supply Chain" },
  { id: 8, title: "QMS Audit 08", subtitle: "Health Security" },
];

const FormsManagement = () => {
  const navigate = useNavigate();

  return (
    <div className="qms-gradient-bg p-10">
      <div className="w-full">
        <div className="relative mb-12">
          <button 
            onClick={() => navigate("/dashboard")}
            className="absolute left-0 top-0 bg-gray-800 hover:bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm transition"
          >
            &larr; Back to Dashboard
          </button>
          <h1 className="text-center text-4xl font-bold text-white">Form Management</h1>
          <p className="absolute right-0 top-2 text-xs text-white/85 font-medium">QMS Veritas India</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {formItems.map((form) => (
            <div
              key={form.id}
              className="
                bg-[#e8c86d]
                rounded-2xl
                shadow-md
                h-32
                flex
                flex-col
                items-center
                justify-center
                cursor-pointer
                hover:shadow-lg
                hover:scale-105
                transition-all
                p-4"
            >
              <span className="font-bold text-gray-900 text-sm mb-1">{form.title}</span>
              <span className="font-medium text-gray-700 text-xs text-center px-2">{form.subtitle}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormsManagement;
