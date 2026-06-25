import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Auditor {
  A_ID: string;
  Auditor_Name: string;
  Certification: string;
}

const inputCls = "border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full";

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const AuditorMaster = () => {
  const navigate = useNavigate();
  const [auditors, setAuditors] = useState<Auditor[]>([]);
  const [aId, setAId] = useState("");
  const [name, setName] = useState("");
  const [cert, setCert] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCert, setEditCert] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const fetchAuditors = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auditors");
      const data = await res.json() as Auditor[];
      setAuditors(data);
    } catch {
      setError("Failed to load auditors");
    }
  };

  useEffect(() => { void fetchAuditors(); }, []);

  const handleAdd = async () => {
    if (!aId.trim() || !name.trim()) {
      setError("Auditor ID and Name are required");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("http://localhost:5000/api/auditors/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ A_ID: aId.trim(), Auditor_Name: name.trim(), Certification: cert.trim() || null }),
      });
      const text = await res.text();
      let data: { error?: string };
      try { data = JSON.parse(text) as { error?: string }; }
      catch { throw new Error(`Non-JSON: ${text.slice(0, 100)}`); }
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setSuccess("Auditor added successfully");
      setAId(""); setName(""); setCert("");
      void fetchAuditors();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete auditor ${id}?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/auditors/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      void fetchAuditors();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const startEdit = (a: Auditor) => {
    setEditingId(a.A_ID);
    setEditName(a.Auditor_Name);
    setEditCert(a.Certification ?? "");
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName(""); setEditCert(""); setEditError("");
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) { setEditError("Name is required"); return; }
    setEditLoading(true);
    setEditError("");
    try {
      const res = await fetch(`http://localhost:5000/api/auditors/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Auditor_Name: editName.trim(), Certification: editCert.trim() || null }),
      });
      const text = await res.text();
      let data: { error?: string };
      try { data = JSON.parse(text) as { error?: string }; }
      catch { throw new Error(`Non-JSON: ${text.slice(0, 100)}`); }
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setEditingId(null);
      void fetchAuditors();
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="qms-gradient-bg min-h-screen p-10">
      <div className="w-full max-w-4xl mx-auto">
        <div className="relative mb-12">
          <button
            onClick={() => navigate("/audit-management")}
            className="absolute left-0 top-0 bg-gray-800 hover:bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm transition"
          >
            &larr; Back
          </button>
          <h1 className="text-center text-4xl font-bold text-white">Auditor Master</h1>
          <p className="absolute right-0 top-2 text-xs text-white/85 font-medium">QMS Veritas India</p>
        </div>

        {/* Add form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Add Auditor</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <Field label="Auditor ID" required>
              <input className={inputCls} value={aId} onChange={e => setAId(e.target.value)} placeholder="e.g. A_C_ID-4" />
            </Field>
            <Field label="Auditor Name" required>
              <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. DEF" />
            </Field>
            <Field label="Certification Link">
              <input className={inputCls} value={cert} onChange={e => setCert(e.target.value)} placeholder="https://..." />
            </Field>
          </div>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-2">{success}</p>}
          <button
            onClick={handleAdd}
            disabled={loading}
            className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-full text-sm transition disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Auditor"}
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Auditor List</h2>
          {auditors.length === 0 ? (
            <p className="text-sm text-gray-400">No auditors added yet.</p>
          ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-gray-600 font-semibold">Auditor ID</th>
                    <th className="text-left py-2 px-3 text-gray-600 font-semibold">Name</th>
                    <th className="text-left py-2 px-3 text-gray-600 font-semibold">Certification</th>
                    <th className="text-left py-2 px-3 text-gray-600 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {auditors.map(a => (
                    <tr key={a.A_ID} className="border-b last:border-0 hover:bg-gray-50">
                      {editingId === a.A_ID ? (
                        <>
                          <td className="py-2 px-3 text-gray-500 text-xs">{a.A_ID}</td>
                          <td className="py-2 px-3">
                            <input
                              className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-400"
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-400"
                              value={editCert}
                              onChange={e => setEditCert(e.target.value)}
                            />
                            {editError && <p className="text-red-500 text-xs mt-1">{editError}</p>}
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => void handleUpdate(a.A_ID)}
                                disabled={editLoading}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full text-xs transition disabled:opacity-50"
                              >
                                {editLoading ? "Saving..." : "Save"}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-full text-xs transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                          <>
                            <td className="py-2 px-3 text-gray-700">{a.A_ID}</td>
                            <td className="py-2 px-3 text-gray-700">{a.Auditor_Name}</td>
                            <td className="py-2 px-3 text-gray-500 text-xs">
                              {a.Certification
                                ? <a href={a.Certification} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{a.Certification}</a>
                                : <span className="italic">—</span>
                              }
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEdit(a)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs transition"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => void handleDelete(a.A_ID)}
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
    </div>
  );
};

export default AuditorMaster;
