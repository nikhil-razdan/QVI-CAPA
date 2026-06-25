import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Company {
    C_ID: string;
    Company_Name: string;
}

const inputCls = "border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full";

const CompanyMaster = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [cId, setCId] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchCompanies = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/companies");
            const data = await res.json() as Company[];
            setCompanies(data);
        } catch {
            setError("Failed to load companies");
        }
    };

    useEffect(() => { void fetchCompanies(); }, []);

    const handleAdd = async () => {
        if (!cId.trim() || !name.trim()) {
            setError("Both Company ID and Name are required");
            return;
        }
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch("http://localhost:5000/api/companies/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ C_ID: cId.trim(), Company_Name: name.trim() }),
            });
            const text = await res.text();
            let data: { error?: string };
            try { data = JSON.parse(text) as { error?: string }; }
            catch { throw new Error(`Non-JSON: ${text.slice(0, 100)}`); }
            if (!res.ok) throw new Error(data.error ?? "Failed");
            setSuccess("Company added successfully");
            setCId("");
            setName("");
            void fetchCompanies();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="qms-gradient-bg min-h-screen p-10">
            <div className="w-full max-w-3xl mx-auto">
                <div className="relative mb-12">
                    <button
                        onClick={() => navigate("/audit-management")}
                        className="absolute left-0 top-0 bg-gray-800 hover:bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm transition"
                    >
                        &larr; Back
                    </button>
                    <h1 className="text-center text-4xl font-bold text-white">Company Master</h1>
                    <p className="absolute right-0 top-2 text-xs text-white/85 font-medium">QMS Veritas India</p>
                </div>

                {/* Add form */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Add Company</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-1">Company ID <span className="text-red-500">*</span></label>
                            <input className={inputCls} value={cId} onChange={e => setCId(e.target.value)} placeholder="e.g. C003" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-1">Company Name <span className="text-red-500">*</span></label>
                            <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tata Steel Ltd" />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                    {success && <p className="text-green-600 text-sm mb-2">{success}</p>}
                    <button
                        onClick={handleAdd}
                        disabled={loading}
                        className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-full text-sm transition disabled:opacity-50"
                    >
                        {loading ? "Adding..." : "Add Company"}
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Existing Companies</h2>
                    {companies.length === 0 ? (
                        <p className="text-sm text-gray-400">No companies added yet.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 px-3 text-gray-600 font-semibold">Company ID</th>
                                    <th className="text-left py-2 px-3 text-gray-600 font-semibold">Company Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.map(c => (
                                    <tr key={c.C_ID} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-2 px-3 text-gray-700">{c.C_ID}</td>
                                        <td className="py-2 px-3 text-gray-700">{c.Company_Name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompanyMaster;
