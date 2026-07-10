import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Company {
    C_ID: string;
    Company_Name: string;
    Company_Email?: string | null;
    Company_Address?: string | null;
    Company_Contact?: string | null;
}

const inputCls = "border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full";

const DetailRow = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex flex-col gap-0.5 py-2 border-b last:border-0">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <span className="text-sm text-gray-800">{value ? value : <span className="italic text-gray-400">—</span>}</span>
    </div>
);

const CompanyDetailModal = ({ company, onClose }: { company: Company; onClose: () => void }) => (
    <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
        <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-800">{company.Company_Name}</h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-700 text-xl leading-none"
                    aria-label="Close"
                >
                    &times;
                </button>
            </div>
            <div className="flex flex-col">
                <DetailRow label="Company ID" value={company.C_ID} />
                <DetailRow label="Email" value={company.Company_Email} />
                <DetailRow label="Address" value={company.Company_Address} />
                <DetailRow label="Contact Number" value={company.Company_Contact} />
            </div>
            <button
                onClick={onClose}
                className="mt-4 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-full text-sm transition w-full"
            >
                Close
            </button>
        </div>
    </div>
);

const CompanyMaster = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [cId, setCId] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [contact, setContact] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [editContact, setEditContact] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");

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
                body: JSON.stringify({
                    C_ID: cId.trim(),
                    Company_Name: name.trim(),
                    Company_Email: email.trim() || null,
                    Company_Address: address.trim() || null,
                    Company_Contact: contact.trim() || null,
                }),
            });
            const text = await res.text();
            let data: { error?: string };
            try { data = JSON.parse(text) as { error?: string }; }
            catch { throw new Error(`Non-JSON: ${text.slice(0, 100)}`); }
            if (!res.ok) throw new Error(data.error ?? "Failed");
            setSuccess("Company added successfully");
            setCId("");
            setName("");
            setEmail("");
            setAddress("");
            setContact("");
            void fetchCompanies();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(`Delete company ${id}?`)) return;
        try {
            const res = await fetch(`http://localhost:5000/api/companies/${encodeURIComponent(id)}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const text = await res.text();
                let data: { error?: string };
                try { data = JSON.parse(text) as { error?: string }; }
                catch { throw new Error("Delete failed"); }
                throw new Error(data.error ?? "Delete failed");
            }
            void fetchCompanies();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Delete failed");
        }
    };

    const startEdit = (c: Company) => {
        setEditingId(c.C_ID);
        setEditName(c.Company_Name);
        setEditEmail(c.Company_Email ?? "");
        setEditAddress(c.Company_Address ?? "");
        setEditContact(c.Company_Contact ?? "");
        setEditError("");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName(""); setEditEmail(""); setEditAddress(""); setEditContact(""); setEditError("");
    };

    const handleUpdate = async (id: string) => {
        if (!editName.trim()) { setEditError("Name is required"); return; }
        setEditLoading(true);
        setEditError("");
        try {
            const res = await fetch(`http://localhost:5000/api/companies/${encodeURIComponent(id)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Company_Name: editName.trim(),
                    Company_Email: editEmail.trim() || null,
                    Company_Address: editAddress.trim() || null,
                    Company_Contact: editContact.trim() || null,
                }),
            });
            const text = await res.text();
            let data: { error?: string };
            try { data = JSON.parse(text) as { error?: string }; }
            catch { throw new Error(`Non-JSON: ${text.slice(0, 100)}`); }
            if (!res.ok) throw new Error(data.error ?? "Update failed");
            setEditingId(null);
            void fetchCompanies();
        } catch (e) {
            setEditError(e instanceof Error ? e.message : "Update failed");
        } finally {
            setEditLoading(false);
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
                        <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-1">Company Email</label>
                            <input className={inputCls} value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. contact@company.com" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-1">Company Contact Number</label>
                            <input className={inputCls} value={contact} onChange={e => setContact(e.target.value)} placeholder="e.g. 9800000000" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-sm font-semibold text-gray-700 block mb-1">Company Address</label>
                            <input className={inputCls} value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. Jamshedpur, Jharkhand" />
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
                                    <th className="text-left py-2 px-3 text-gray-600 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.map(c => (
                                    <tr
                                        key={c.C_ID}
                                        className={`border-b last:border-0 hover:bg-gray-50 ${editingId === c.C_ID ? "" : "cursor-pointer"}`}
                                        onClick={() => { if (editingId !== c.C_ID) setSelectedCompany(c); }}
                                    >
                                        {editingId === c.C_ID ? (
                                            <>
                                                <td className="py-2 px-3 text-gray-500 text-xs">{c.C_ID}</td>
                                                <td className="py-2 px-3">
                                                    <input
                                                        className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-400 mb-1"
                                                        value={editName}
                                                        onChange={e => setEditName(e.target.value)}
                                                        placeholder="Name"
                                                        onClick={e => e.stopPropagation()}
                                                    />
                                                    <input
                                                        className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-400 mb-1"
                                                        value={editEmail}
                                                        onChange={e => setEditEmail(e.target.value)}
                                                        placeholder="Email"
                                                        onClick={e => e.stopPropagation()}
                                                    />
                                                    <input
                                                        className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-400 mb-1"
                                                        value={editAddress}
                                                        onChange={e => setEditAddress(e.target.value)}
                                                        placeholder="Address"
                                                        onClick={e => e.stopPropagation()}
                                                    />
                                                    <input
                                                        className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-400"
                                                        value={editContact}
                                                        onChange={e => setEditContact(e.target.value)}
                                                        placeholder="Contact"
                                                        onClick={e => e.stopPropagation()}
                                                    />
                                                    {editError && <p className="text-red-500 text-xs mt-1">{editError}</p>}
                                                </td>
                                                <td className="py-2 px-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={e => { e.stopPropagation(); void handleUpdate(c.C_ID); }}
                                                            disabled={editLoading}
                                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full text-xs transition disabled:opacity-50"
                                                        >
                                                            {editLoading ? "Saving..." : "Save"}
                                                        </button>
                                                        <button
                                                            onClick={e => { e.stopPropagation(); cancelEdit(); }}
                                                            className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-full text-xs transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="py-2 px-3 text-gray-700">{c.C_ID}</td>
                                                <td className="py-2 px-3 text-gray-700">{c.Company_Name}</td>
                                                <td className="py-2 px-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={e => { e.stopPropagation(); startEdit(c); }}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs transition"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={e => { e.stopPropagation(); void handleDelete(c.C_ID); }}
                                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs transition"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {selectedCompany && (
                <CompanyDetailModal company={selectedCompany} onClose={() => setSelectedCompany(null)} />
            )}
        </div>
    );
};

export default CompanyMaster;
