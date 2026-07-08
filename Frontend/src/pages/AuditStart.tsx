import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formItems } from '../data/forms';

const inputCls = "border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";

interface Company { C_ID: string; Company_Name: string; }
interface Auditor { A_ID: string; Auditor_Name: string; }

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const AuditStart = () => {
  const navigate = useNavigate();
  const { formId, level } = useParams();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [auditors, setAuditors] = useState<Auditor[]>([]);
  const [C_ID, setCID] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [A_ID, setAID] = useState('');
  const [auditorName, setAuditorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formMeta = formItems.find(f => String(f.id) === formId);

  useEffect(() => {
    fetch("http://localhost:5000/api/companies")
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(data => setCompanies(Array.isArray(data) ? data : []))
      .catch(() => setCompanies([]));
    fetch("http://localhost:5000/api/auditors")
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(data => setAuditors(Array.isArray(data) ? data : []))
      .catch(() => setAuditors([]));
  }, []);

  const handleStart = async () => {
    if (!C_ID || !A_ID) {
      setError('Select a company and an auditor');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/audits/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ C_ID, Form_ID: formId, Level: level, Status: 'Planned' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Request failed');

      const params = new URLSearchParams({
        Company_Name: companyName,
        Auditor_ID: A_ID,
        Auditor_Name: auditorName,
      });
      navigate(`/audit-management/form-master/${formId}/level/${level}/embed?${params.toString()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qms-gradient-bg min-h-screen p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b">
          <button
            onClick={() => navigate(`/audit-management/form-master/${formId}/level`)}
            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm transition"
          >
            &larr; Back
          </button>
          <div className="bg-red-700 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xs shrink-0">QVI</div>
          <h1 className="text-xl font-bold text-gray-900">
            Start {formMeta?.title ?? `Form ${formId}`} — Level {level}
          </h1>
        </div>

        <div className="flex flex-col gap-4">
          <Field label="Company Name" required>
            <select
              className={inputCls}
              value={companyName}
              onChange={e => {
                const sel = companies.find(c => c.Company_Name === e.target.value);
                setCompanyName(e.target.value);
                setCID(sel?.C_ID ?? '');
              }}
            >
              <option value="">Select a company</option>
              {companies.map(c => <option key={c.C_ID} value={c.Company_Name}>{c.Company_Name}</option>)}
            </select>
          </Field>

          <Field label="QVI Auditor" required>
            <select
              className={inputCls}
              value={auditorName}
              onChange={e => {
                const sel = auditors.find(a => a.Auditor_Name === e.target.value);
                setAuditorName(e.target.value);
                setAID(sel?.A_ID ?? '');
              }}
            >
              <option value="">Select an auditor</option>
              {auditors.map(a => <option key={a.A_ID} value={a.Auditor_Name}>{a.Auditor_Name}</option>)}
            </select>
          </Field>
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <div className="flex justify-end mt-8 pt-4 border-t">
          <button
            onClick={handleStart}
            disabled={loading}
            className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-full text-sm transition disabled:opacity-50"
          >
            {loading ? 'Starting...' : 'Start Audit →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditStart;
