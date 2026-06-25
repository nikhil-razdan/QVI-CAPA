import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINS = ['00', '15', '30', '45'];

const inputCls = "border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";
const selectCls = "border border-gray-300 rounded-lg px-2 py-2 text-sm flex-1 focus:outline-none";

interface FormState {
  C_ID: string; Company_Name: string; QMS_Head_Name: string;
  QMS_Head_Email: string; QMS_Head_Phone: string; Date_Of_Audit: string;
  Opening_Start_HH: string; Opening_Start_MM: string; Opening_Start_AMPM: string;
  Opening_End_HH: string; Opening_End_MM: string; Opening_End_AMPM: string;
  Total_Members: string; Auditor_ID: string; Auditor_Name: string;
}

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const empty: FormState = {
  C_ID: '', Company_Name: '', QMS_Head_Name: '', QMS_Head_Email: '',
  QMS_Head_Phone: '', Date_Of_Audit: '',
  Opening_Start_HH: '', Opening_Start_MM: '', Opening_Start_AMPM: '',
  Opening_End_HH: '', Opening_End_MM: '', Opening_End_AMPM: '',
  Total_Members: '', Auditor_ID: '', Auditor_Name: '',
};

const AuditPage1 = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [companies, setCompanies] = useState<{C_ID: string; Company_Name: string}[]>([]);

  const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.C_ID || !form.Company_Name) {
      setError('Company ID and Company Name are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const text = await res.text();
      let data: { sessionID?: number; error?: string };
      try {
        data = JSON.parse(text) as { sessionID?: number; error?: string };
      } catch {
        throw new Error(`Server returned non-JSON: ${text.slice(0, 100)}`);
      }

      if (!res.ok) throw new Error(data.error ?? 'Request failed');
      navigate('/forms/1/page2', { state: { sessionID: data.sessionID } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetch("http://localhost:5000/api/companies")
      .then(r => r.json())
      .then(data => setCompanies(data as { C_ID: string, Com: string }[]))
      .catch(()=>{})
  }, [])

  return (
    <div className="qms-gradient-bg min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b">
          <button
            onClick={() => navigate("/audit-management/form-master")}
            className="absolute left-10 top-10 bg-gray-800 hover:bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm transition"
          >
            &larr; Back
          </button>

          <div className="bg-red-700 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xs shrink-0">QVI</div>
          <h1 className="text-xl font-bold text-gray-900">QMS Audit 01 : QUALITY MANAGEMENT</h1>
        </div>

        <div className="flex gap-8 mb-8 text-sm border-b">
          {['Page 1', 'Page 2', 'Page 3', 'Page 4'].map((p, i) => (
            <span key={i} className={`pb-2 ${i === 0 ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : 'text-gray-400'}`}>{p}</span>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <Field label="Company Name" required>
              <select
                className={inputCls}
                value={form.Company_Name}
                onChange={e => {
                  const selected = companies.find(c => c.Company_Name === e.target.value);
                  setForm(f => ({
                    ...f,
                    Company_Name: e.target.value,
                    C_ID: selected?.C_ID ?? ""
                  }));
                }}
              >
                <option value="">Select a company</option>
                {companies.map(c => (
                  <option key={c.C_ID} value={c.Company_Name}>{c.Company_Name}</option>
                ))}
              </select>
            </Field>
            <Field label="Company ID">
              <input
                className={`${inputCls} bg-gray-100 cursor-not-allowed`}
                value={form.C_ID}
                readOnly
                placeholder="Auto-filled from company selection"
              />
            </Field>
            <Field label="QMS Compliance Head Name" required>
              <input className={inputCls} value={form.QMS_Head_Name} onChange={e => set('QMS_Head_Name', e.target.value)} />
            </Field>
            <Field label="QMS Compliance Head Email" required>
              <input type="email" className={inputCls} value={form.QMS_Head_Email} onChange={e => set('QMS_Head_Email', e.target.value)} />
            </Field>
            <Field label="QMS Compliance Head Phone" required>
              <input className={inputCls} value={form.QMS_Head_Phone} onChange={e => set('QMS_Head_Phone', e.target.value)} />
            </Field>
            <Field label="Date of Audit" required>
              <input type="date" className={inputCls} value={form.Date_Of_Audit} onChange={e => set('Date_Of_Audit', e.target.value)} />
            </Field>
            <Field label="Opening Meeting Start Time" required>
              <div className="flex gap-2">
                <select className={selectCls} value={form.Opening_Start_HH} onChange={e => set('Opening_Start_HH', e.target.value)}>
                  <option value="">HH</option>
                  {HOURS.map(h => <option key={h}>{h}</option>)}
                </select>
                <select className={selectCls} value={form.Opening_Start_MM} onChange={e => set('Opening_Start_MM', e.target.value)}>
                  <option value="">MM</option>
                  {MINS.map(m => <option key={m}>{m}</option>)}
                </select>
                <select className={selectCls} value={form.Opening_Start_AMPM} onChange={e => set('Opening_Start_AMPM', e.target.value)}>
                  <option value="">AM/PM</option>
                  <option>AM</option>
                  <option>PM</option>
                </select>
              </div>
            </Field>
          </div>

          <div className="flex flex-col gap-4">
            <Field label="End Time of Opening Meeting" required>
              <div className="flex gap-2">
                <select className={selectCls} value={form.Opening_End_HH} onChange={e => set('Opening_End_HH', e.target.value)}>
                  <option value="">HH</option>
                  {HOURS.map(h => <option key={h}>{h}</option>)}
                </select>
                <select className={selectCls} value={form.Opening_End_MM} onChange={e => set('Opening_End_MM', e.target.value)}>
                  <option value="">MM</option>
                  {MINS.map(m => <option key={m}>{m}</option>)}
                </select>
                <select className={selectCls} value={form.Opening_End_AMPM} onChange={e => set('Opening_End_AMPM', e.target.value)}>
                  <option value="">AM/PM</option>
                  <option>AM</option>
                  <option>PM</option>
                </select>
              </div>
            </Field>
            <Field label="Total Company Members in Opening Meeting" required>
              <input type="number" className={inputCls} value={form.Total_Members} onChange={e => set('Total_Members', e.target.value)} />
            </Field>
            <Field label="QVI Auditor's ID" required>
              <input className={inputCls} value={form.Auditor_ID} onChange={e => set('Auditor_ID', e.target.value)} />
            </Field>
            <Field label="QVI Auditor's Name" required>
              <input className={inputCls} value={form.Auditor_Name} onChange={e => set('Auditor_Name', e.target.value)} />
            </Field>
            <Field label="Attach Opening Meeting Attendance Sheet" required>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-gray-400">
                File upload — Phase 2
              </div>
            </Field>
            <Field label="Digital Signature of QMS Head" required>
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex items-center justify-center text-sm text-gray-400">
                Signature canvas — Phase 2
              </div>
            </Field>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <div className="flex justify-between items-center mt-8 pt-4 border-t">
          <span className="text-xs text-gray-400">1 / 4</span>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-full text-sm transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save & Next →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditPage1;
