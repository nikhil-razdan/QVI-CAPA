export interface ZohoFormConfig {
  zohoBaseUrl: string;
  prefillParams: {
    companyName: string;
    auditorId: string;
    auditorName: string;
  };
}

export const zohoFormConfig: Record<string, ZohoFormConfig> = {
  "1-1": {
    zohoBaseUrl: "https://forms.zohopublic.in/QVIAudits/form/AUDITQUESTIONNAIRECHAPTER1/formperma/bJNKr4MqWNqklPIVErYWmQA7YwZUuhgxBabnCxm7ueQ",
    prefillParams: { companyName: "Company_Name", auditorId: "Auditor_ID", auditorName: "Auditor_Name" },
  },
  "2-1": { 
    zohoBaseUrl:"https://forms.zohopublic.in/QVIAudits/form/QMSAudit02/formperma/-EfLMiEGhhhjaxulhq6K_tEbMQaREcvLrkoU82Y9Uu4",
    prefillParams: { companyName: "Company_Name", auditorId: "Auditor_ID", auditorName: "Auditor_Name" },
  },
  "3-1": { 
    zohoBaseUrl:"https://forms.zohopublic.in/QVIAudits/form/QMSAudit03/formperma/oImhxioShkzxir95dK0pVpykbSKrydzyZPFU9tZFBFg",
    prefillParams: { companyName: "Company_Name", auditorId: "Auditor_ID", auditorName: "Auditor_Name" },
  },
  "4-1": { 
    zohoBaseUrl:"https://forms.zohopublic.in/QVIAudits/form/QMSAudit04/formperma/wQ30jHxAJAjBu1kV1p4wI-9qhIiBsvQJceX94BSAfcU",
    prefillParams: { companyName: "Company_Name", auditorId: "Auditor_ID", auditorName: "Auditor_Name" },
  },
  "5-1": { 
    zohoBaseUrl:"https://forms.zohopublic.in/QVIAudits/form/QMSAudit05/formperma/nIdrlvDBNKIAezGIm6DIOpyUYp7Jdf2sduBLb8VJ4zo",
    prefillParams: { companyName: "Company_Name", auditorId: "Auditor_ID", auditorName: "Auditor_Name" },
  },
  "6-1": { 
    zohoBaseUrl:"https://forms.zohopublic.in/QVIAudits/form/QMSAudit06/formperma/K8bTi4EhUxGtySxA8YoIHU7A6XyzN835t7_ieErod1w",
    prefillParams: { companyName: "Company_Name", auditorId: "Auditor_ID", auditorName: "Auditor_Name" },
  },
  "7-1": { 
    zohoBaseUrl:"https://forms.zohopublic.in/QVIAudits/form/QMSAudit07/formperma/nyTuuavZcrDCDsH9aP3l4Ik41LvdoqjDaeBIKCkpI20",
    prefillParams: { companyName: "Company_Name", auditorId: "Auditor_ID", auditorName: "Auditor_Name" },
  },
  "8-1": { 
    zohoBaseUrl:"https://forms.zohopublic.in/QVIAudits/form/QMSAudit08/formperma/lEUQtdT4AhvQef3cdW1OCX_4r7REh1J1ji_-SlqeQl0",
    prefillParams: { companyName: "Company_Name", auditorId: "Auditor_ID", auditorName: "Auditor_Name" },
  },
};

export function getZohoFormConfig(formId: string | number, level: string | number) {
  return zohoFormConfig[`${formId}-${level}`];
}
