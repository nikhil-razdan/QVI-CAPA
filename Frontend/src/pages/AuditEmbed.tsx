import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { getZohoFormConfig } from '../config/zohoFormConfig';
import { formItems } from '../data/forms';

const AuditEmbed = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { formId, level } = useParams();
  const containerRef = useRef<HTMLDivElement>(null);

  const config = getZohoFormConfig(formId ?? '', level ?? '');
  const formMeta = formItems.find(f => String(f.id) === formId);

useEffect(() => {
  if (!config || !containerRef.current) return;

  containerRef.current.innerHTML = ''; // clear before appending, not just on cleanup

  const query = new URLSearchParams({
    [config.prefillParams.companyName]: params.get('Company_Name') ?? '',
    [config.prefillParams.auditorId]: params.get('Auditor_ID') ?? '',
    [config.prefillParams.auditorName]: params.get('Auditor_Name') ?? '',
    zf_rszfm: '1',
    zf_enablecamera: 'true',
  });

  const iframe = document.createElement('iframe');
  iframe.src = `${config.zohoBaseUrl}?${query.toString()}`;
  iframe.style.border = 'none';
  iframe.style.width = '100%';
  iframe.style.height = '1200px';
  iframe.style.transition = 'height 0.3s ease';
  iframe.setAttribute('aria-label', formMeta?.title ?? 'QMS Audit Form');
  iframe.setAttribute('allow', 'camera;');
  containerRef.current.appendChild(iframe);

  const handleMessage = (event: MessageEvent) => {
    if (typeof event.data !== 'string') return;
    const parts = event.data.split('|');
    if (parts.length === 2 || parts.length === 3) {
      const zfPerma = parts[0];
      if (iframe.src.includes('formperma') && iframe.src.includes(zfPerma)) {
        iframe.style.height = `${parseInt(parts[1], 10) + 15}px`;
        if (parts.length === 3) iframe.scrollIntoView();
      }
    }
  };
  window.addEventListener('message', handleMessage);

  return () => {
    window.removeEventListener('message', handleMessage);
  };
}, [config?.zohoBaseUrl, formId, level]);

  if (!config) {
    return (
      <div className="min-h-screen p-8 text-center text-gray-500">
        No Zoho form configured for Form {formId}, Level {level} yet.
        <div className="mt-4">
          <button onClick={() => navigate(-1)} className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm">
            &larr; Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <button
        onClick={() => navigate(`/audit-management/form-master/${formId}/level`)}
        className="mb-4 bg-gray-800 hover:bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm"
      >
        &larr; Back
      </button>
      <div ref={containerRef} />
    </div>
  );
};

export default AuditEmbed;
