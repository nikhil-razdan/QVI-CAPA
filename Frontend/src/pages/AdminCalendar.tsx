import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface CalendarRow {
  Session_ID: number;
  Company_Name: string;
  Auditor_Name: string;
  Date_Of_Audit: string;
  Status: string;
}

const AdminCalendar = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<CalendarRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/audits/calendar")
      .then(r => r.json())
      .then(data => setRows(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const grouped = rows.reduce<Record<string, CalendarRow[]>>((acc, row) => {
    const key = row.Date_Of_Audit ?? "Unscheduled";
    (acc[key] ??= []).push(row);
    return acc;
  }, {});

  return (
    <div className="qms-gradient-bg min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b">
          <button onClick={() => navigate("/audit-management")} className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm transition">&larr; Back</button>
          <h1 className="text-xl font-bold text-gray-900">Master Admin Calendar</h1>
        </div>

        {loading && <p className="text-sm text-gray-500">Loading...</p>}

        {!loading && Object.keys(grouped).sort().map(date => (
          <div key={date} className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">{date}</h3>
            <div className="space-y-1">
              {grouped[date].map(r => (
                <div key={r.Session_ID} className="flex justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                  <span>{r.Company_Name}</span>
                  <span className="text-gray-500">{r.Auditor_Name}</span>
                  <span className={`text-xs font-bold ${r.Status === "Submitted" ? "text-green-600" : "text-blue-600"}`}>{r.Status}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {!loading && rows.length === 0 && <p className="text-sm text-gray-400">No scheduled or submitted audits yet.</p>}
      </div>
    </div>
  );
};

export default AdminCalendar;
