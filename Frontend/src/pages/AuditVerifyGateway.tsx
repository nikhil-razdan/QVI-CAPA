import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface GatewayPayload {
  Session_ID: number;
  C_ID: string;
  Company_Name: string;
  Company_Email: string;
  Company_Address: string;
  Date_Of_Audit: string;
  Auditor_ID: string;
  Auditor_Name: string;
}

const AuditVerifyGateway = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [payload, setPayload] = useState<GatewayPayload | null>(null);
  const [errorFlag, setErrorFlag] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    // Read secure params out of direct links sent to auditor mailbox[cite: 2]
    const s_id = searchParams.get("session_id") || "1";
    const a_id = searchParams.get("auditor_id") || "A_C_ID-1";

    fetch(`http://localhost:5000/api/audits/verify-checkpoint?session_id=${s_id}&auditor_id=${a_id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Security check failed to validate authorization parameters.");
        return res.json();
      })
      .then((data) => {
        if (data.verified) setPayload(data.data);
        else setErrorFlag(data.message);
      })
      .catch((err) => setErrorFlag(err instanceof Error ? err.message : "Gateway error"));
  }, [searchParams]);

  if (errorFlag) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl max-w-md shadow-md text-center">
          <h3 className="text-lg font-bold mb-2">⚠️ Checkpoint Exception Violation</h3>
          <p className="text-sm">{errorFlag}</p>
        </div>
      </div>
    );
  }

  if (!payload) {
    return <div className="min-h-screen flex items-center justify-center text-sm font-medium text-gray-500">Querying System Integrity Keys...</div>;
  }

  return (
    <div className="qms-gradient-bg min-h-screen p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-[#0f172a] p-6 text-white text-center">
          <h2 className="text-xl font-bold">QVI-CAPA Gateway — Auditor Verification</h2>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold text-center">
            ✓ Secure Authorization Profile Validated
          </div>

          <div className="border border-gray-200 rounded-xl p-5 bg-gray-50 space-y-2">
            <h4 className="text-xs font-bold text-blue-700 tracking-wider uppercase mb-3">🏭 Target Factory Profile</h4>
            <p className="text-sm text-gray-700"><b>Company Name:</b> {payload.Company_Name} ({payload.C_ID})</p>
            <p className="text-sm text-gray-700"><b>Deployment Location:</b> {payload.Company_Address}</p>
            <p className="text-sm text-gray-700"><b>Notification Node:</b> {payload.Company_Email}</p>
          </div>

          <div className="border border-gray-200 rounded-xl p-5 bg-gray-50 space-y-2">
            <h4 className="text-xs font-bold text-blue-700 tracking-wider uppercase mb-3">👨‍💻 Assigned Auditor Metrics</h4>
            <p className="text-sm text-gray-700"><b>Inspector Name:</b> {payload.Auditor_Name}</p>
            <p className="text-sm text-gray-700"><b>Security Passport ID:</b> {payload.Auditor_ID}</p>
          </div>

          {!unlocked ? (
            <div className="pt-4 border-t border-gray-100 text-center">
              <p className="text-sm font-medium text-gray-600 mb-4">Are the assignment details above correct?</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => alert("Verification error registered. Logs submitted to Admin context box.")}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-5 py-2.5 rounded-xl text-sm font-medium transition"
                >
                  X No, Fix Error
                </button>
                <button
                  onClick={() => setUnlocked(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-sm"
                >
                  ✓ Yes, Open Audit Form
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-center space-y-2">
              <h4 className="font-bold text-sm">Questionnaire Unlocked</h4>
              <p className="text-xs text-emerald-700">Embedding direct operational answers. Ingestion pipeline is now open.</p>
              <button 
                onClick={() => navigate(`/audit-management/form-master/1/level/1/embed?Session_ID=${payload.Session_ID}`)}
                className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition"
              >
                Proceed to Live Form &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditVerifyGateway;
