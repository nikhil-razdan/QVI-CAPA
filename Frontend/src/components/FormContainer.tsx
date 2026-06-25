import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formSchemas } from "../data/formSchemas";

interface RowResponse {
  compliance: "C" | "NC" | "NA" | "";
  finding: string;
}

const pdfFileMap: Record<number, string> = {
  1: "QMS Audit 01 - Quality Management.pdf",
  2: "QMS Audit 02 - Product Development.pdf",
  3: "QMS Audit 03 - Purchases.pdf",
  4: "QMS Audit 04 - Receipt of Raw Materials and Components.pdf",
  5: "QMS Audit 05 - Manufacturing.pdf",
  6: "QMS Audit 06 - Final Product.pdf",
  7: "QMS Audit 07 - Traceability and Supply Chain.pdf",
  8: "QMS Audit 08 - Health Security.pdf",
};

const FormContainer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const formId = id ? parseInt(id, 10) : null;
  const schema = formId ? formSchemas[formId] : null;
  const pdfName = formId ? pdfFileMap[formId] : "";

  // PDF Embedding Toggle State
  const [showPdf, setShowPdf] = useState(false);

  // Global Form Metadata States
  const [meta, setMeta] = useState({
    auditor: "",
    date: "",
    auditee: "",
    location: ""
  });

  // Dynamic Row Evaluation Matrix States
  const [evaluation, setEvaluation] = useState<Record<string, RowResponse>>({});

  useEffect(() => {
    if (schema) {
      const initialRows: Record<string, RowResponse> = {};
      schema.items.forEach(item => {
        initialRows[item.srNo] = { compliance: "", finding: "" };
      });
      setEvaluation(initialRows);
    }
  }, [schema]);

  if (!schema) {
    return (
      <div className="p-10 text-center text-white bg-red-900 min-h-screen">
        <h2 className="text-2xl font-bold">Form Schema Not Found</h2>
        <button onClick={() => navigate("/forms")} className="mt-4 bg-white text-black px-4 py-2 rounded">
          Back to Forms
        </button>
      </div>
    );
  }

  const handleStatusChange = (srNo: string, val: "C" | "NC" | "NA") => {
    setEvaluation(prev => ({
      ...prev,
      [srNo]: { ...prev[srNo], compliance: val }
    }));
  };

  const handleFindingChange = (srNo: string, val: string) => {
    setEvaluation(prev => ({
      ...prev,
      [srNo]: { ...prev[srNo], finding: val }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting Form Payload:", { formId, meta, evaluation });
    alert("Form submitted safely! (Check developer console logs)");
  };

  return (
    <div className="qms-gradient-bg min-h-screen p-6 md:p-12 text-gray-100">
      {/* Outer Main Container */}
      <div className="max-w-6xl mx-auto bg-[#2b261f]/95 backdrop-blur-md rounded-3xl p-6 md:p-10 border border-white/5 shadow-2xl relative min-h-[600px]">
        
        {/* Header Block Section */}
        <div className="relative border-b border-white/5 pb-6 mb-8 flex items-start justify-between">
          <div>
            <button 
              type="button"
              onClick={() => navigate("/forms")}
              className="bg-slate-900/60 hover:bg-slate-900 text-white border border-white/10 px-4 py-1 rounded-full text-xs transition mb-4 block"
            >
              &larr; Return to Forms
            </button>
            <h1 className="text-3xl font-extrabold text-white tracking-wide">{schema.title}</h1>
            <p className="text-[#e8c86d] font-medium text-xs mt-0.5">{schema.subtitle} Checklist</p>
          </div>

          {/* Top-Right Segment Stack: Button perfectly tracked above the QMS rectangle container */}
          <div className="flex flex-col items-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setShowPdf(!showPdf)}
              className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all tracking-wide shadow-md ${
                showPdf 
                  ? "bg-rose-600 hover:bg-rose-700 text-white" 
                  : "bg-slate-900/80 hover:bg-slate-900 text-[#e8c86d] border border-white/10"
              }`}
            >
              {showPdf ? "✕ Hide Reference PDF" : "👁 View Audit PDF"}
            </button>
            
            <div className="bg-white/5 border border-white/10 rounded-md px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-white/70">
              QMS Veritas India
            </div>
          </div>
        </div>

        {/* Dynamic Wrapper Sandbox */}
        <div className="relative w-full h-full min-h-[450px]">
          
          {/* TOGGLE LAYER 1: Embedded Native Interactive PDF frame */}
          {showPdf && pdfName && (
            <div className="absolute inset-0 w-full h-full min-h-[500px] z-30 bg-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-inner animate-fadeIn">
              <iframe
                src={`/pdfs/${encodeURIComponent(pdfName)}#toolbar=1`}
                title="QMS Audit Reference Document"
                className="w-full h-full min-h-[500px]"
                border="0"
              />
            </div>
          )}

          {/* TOGGLE LAYER 2: Your Form Container Data Matrix elements stay loaded natively */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Metadata Input Box Segment */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-black/20 p-5 rounded-2xl border border-white/5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Auditor Name</label>
                <input 
                  type="text" required value={meta.auditor} onChange={(e) => setMeta({...meta, auditor: e.target.value})}
                  className="w-full bg-[#161a23] text-white rounded-lg p-2.5 text-xs border border-white/5 focus:outline-none focus:border-[#e8c86d]" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Audit Date</label>
                <input 
                  type="date" required value={meta.date} onChange={(e) => setMeta({...meta, date: e.target.value})}
                  className="w-full bg-[#161a23] text-white rounded-lg p-2.5 text-xs border border-white/5 focus:outline-none focus:border-[#e8c86d]" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Auditee Entity</label>
                <input 
                  type="text" required value={meta.auditee} onChange={(e) => setMeta({...meta, auditee: e.target.value})}
                  className="w-full bg-[#161a23] text-white rounded-lg p-2.5 text-xs border border-white/5 focus:outline-none focus:border-[#e8c86d]" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Site Location</label>
                <input 
                  type="text" required value={meta.location} onChange={(e) => setMeta({...meta, location: e.target.value})}
                  className="w-full bg-[#161a23] text-white rounded-lg p-2.5 text-xs border border-white/5 focus:outline-none focus:border-[#e8c86d]" 
                />
              </div>
            </div>

            {/* Checklist Dynamic Layout */}
            <div className="overflow-x-auto rounded-2xl border border-white/5 shadow-inner">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#12161f] text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-white/5">
                    <th className="p-4 w-16 text-center">Sr. No.</th>
                    <th className="p-4 w-24">ISO Clause</th>
                    <th className="p-4">Checkpoint / Requirement Descriptions</th>
                    <th className="p-4 w-48 text-center">Compliance Status</th>
                    <th className="p-4 w-64">Audit Observations & Findings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs bg-black/10">
                  {schema.items.map((item) => (
                    <tr key={item.srNo} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 text-center font-mono text-gray-400">{item.srNo}</td>
                      <td className="p-4">
                        <span className="bg-[#e8c86d]/10 text-[#e8c86d] px-2 py-0.5 rounded font-mono font-bold">
                          {item.clause}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300 font-medium leading-relaxed">{item.checkpoint}</td>
                      <td className="p-4">
                        <div className="flex justify-center gap-1.5">
                          {(["C", "NC", "NA"] as const).map((status) => {
                            const isSelected = evaluation[item.srNo]?.compliance === status;
                            let activeClass = "";
                            if (isSelected) {
                              if (status === "C") activeClass = "bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-900/40";
                              if (status === "NC") activeClass = "bg-rose-600 text-white font-bold shadow-lg shadow-rose-900/40";
                              if (status === "NA") activeClass = "bg-amber-600 text-white font-bold shadow-lg shadow-amber-900/40";
                            } else {
                              activeClass = "bg-slate-900/40 text-gray-400 border border-white/5 hover:text-white";
                            }
                            return (
                              <button
                                type="button" key={status} onClick={() => handleStatusChange(item.srNo, status)}
                                className={`w-10 py-1 rounded text-[10px] font-bold transition-all ${activeClass}`}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-4">
                        <input 
                          type="text" placeholder="Add compliance logs..." value={evaluation[item.srNo]?.finding || ""}
                          onChange={(e) => handleFindingChange(item.srNo, e.target.value)}
                          className="w-full bg-[#161a23] text-white text-xs p-2 rounded-lg border border-white/5 focus:outline-none focus:border-[#e8c86d] transition-all"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Layout Bottom Controls */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-[#e8c86d] hover:bg-[#d6b455] text-slate-950 px-6 py-2.5 rounded-xl font-bold text-xs tracking-wide shadow-xl transition transform active:scale-95"
              >
                Finalize & Submit Audit Report
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default FormContainer;
