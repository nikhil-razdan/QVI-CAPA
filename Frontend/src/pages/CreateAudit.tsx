import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

interface CompanyItem {
  C_ID: string;
  Company_Name: string;
}

interface AuditorItem {
  A_ID: string;
  Auditor_Name: string;
}

const CreateAudit = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [auditors, setAuditors] = useState<AuditorItem[]>([]);
  const [loadError, setLoadError] = useState("");

  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedAuditorId, setSelectedAuditorId] = useState("");
  const [auditDate, setAuditDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });

  useEffect(() => {
    const fetchMasters = async () => {
      setLoadError("");
      try {
        const [compRes, audRes] = await Promise.all([
          fetch(`${API_BASE}/companies`),
          fetch(`${API_BASE}/auditors`),
        ]);

        if (!compRes.ok || !audRes.ok) {
          throw new Error(`Failed to load masters (companies: ${compRes.status}, auditors: ${audRes.status})`);
        }

        const compData = await compRes.json();
        const audData = await audRes.json();

        setCompanies(Array.isArray(compData) ? compData : []);
        setAuditors(Array.isArray(audData) ? audData : []);
      } catch (err) {
        console.error("Error loading master dependencies:", err);
        setLoadError(
          err instanceof Error
            ? `Could not load companies/auditors: ${err.message}`
            : "Could not load companies/auditors"
        );
      }
    };
    fetchMasters();
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId || !selectedAuditorId || !auditDate) {
      setMessage({ text: "Please fill all fields before scheduling.", isError: true });
      return;
    }

    const matchedCompany = companies.find(c => c.C_ID === selectedCompanyId);
    const matchedAuditor = auditors.find(a => a.A_ID === selectedAuditorId);

    if (!matchedCompany || !matchedAuditor) return;

    setLoading(true);
    setMessage({ text: "", isError: false });

    try {
      const response = await fetch(`${API_BASE}/audits/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          c_id: matchedCompany.C_ID,
          company_name: matchedCompany.Company_Name,
          auditor_id: matchedAuditor.A_ID,
          auditor_name: matchedAuditor.Auditor_Name,
          date_of_audit: auditDate,
        }),
      });

      const text = await response.text();
      let resData: { message?: string; error?: string };
      try {
        resData = JSON.parse(text);
      } catch {
        throw new Error(`Server returned non-JSON response: ${text.slice(0, 120)}`);
      }

      if (response.ok) {
        setMessage({ text: "Success: Audit scheduled successfully into backend records.", isError: false });
        setSelectedCompanyId("");
        setSelectedAuditorId("");
        setAuditDate("");
      } else {
        setMessage({ text: resData.error || "Failed to commit schedule entry", isError: true });
      }
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Connection error: Failed to connect to middleware server.",
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qms-gradient-bg min-h-screen p-10 flex flex-col items-center">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 mt-10">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/audit-management")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1.5 rounded-full text-sm font-medium transition"
          >
            &larr; Back
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Schedule Audit Loop</h2>
        </div>

        {loadError && (
          <div className="p-4 mb-4 rounded-xl text-sm font-medium bg-red-100 text-red-700">
            {loadError}
          </div>
        )}

        {message.text && (
          <div className={`p-4 mb-4 rounded-xl text-sm font-medium ${message.isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSchedule} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Select Target Factory / Company</label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8c86d]"
            >
              <option value="">-- Choose Company --</option>
              {companies.map((comp) => (
                <option key={comp.C_ID} value={comp.C_ID}>
                  {comp.Company_Name} ({comp.C_ID})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Assign Field Auditor</label>
            <select
              value={selectedAuditorId}
              onChange={(e) => setSelectedAuditorId(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8c86d]"
            >
              <option value="">-- Choose Auditor --</option>
              {auditors.map((aud) => (
                <option key={aud.A_ID} value={aud.A_ID}>
                  {aud.Auditor_Name} ({aud.A_ID})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Target Audit Execution Date</label>
            <input
              type="date"
              value={auditDate}
              onChange={(e) => setAuditDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8c86d]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e8c86d] hover:bg-[#dfba53] text-gray-900 font-bold p-3.5 rounded-xl transition-all shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? "Committing Entry..." : "Lock and Schedule Audit Date"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAudit;
