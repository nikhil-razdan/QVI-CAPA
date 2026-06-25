export interface AuditItem {
  srNo: string;
  clause: string;
  checkpoint: string;
}

export interface FormSchema {
  id: number;
  title: string;
  subtitle: string;
  items: AuditItem[];
}

export const formSchemas: Record<number, FormSchema> = {
  1: {
    id: 1,
    title: "QMS Audit 01",
    subtitle: "Quality Management",
    items: [
      { srNo: "1", clause: "4.1", checkpoint: "Understanding the organization and its context." },
      { srNo: "2", clause: "4.2", checkpoint: "Understanding the needs and expectations of interested parties." },
      { srNo: "3", clause: "5.1", checkpoint: "Leadership and commitment from top management." },
      { srNo: "4", clause: "6.1", checkpoint: "Actions to address risks and opportunities." }
    ]
  },
  2: {
    id: 2,
    title: "QMS Audit 02",
    subtitle: "Product Development",
    items: [
      { srNo: "1", clause: "8.3.2", checkpoint: "Design and development planning procedures." },
      { srNo: "2", clause: "8.3.3", checkpoint: "Design and development inputs review." }
    ]
  },
  3: {
    id: 3,
    title: "QMS Audit 03",
    subtitle: "Purchases",
    items: [
      { srNo: "1", clause: "8.4.1", checkpoint: "Evaluation, selection, and re-evaluation of external providers." },
      { srNo: "2", clause: "8.4.2", checkpoint: "Type and extent of control over external supply chains." }
    ]
  },
  4: {
    id: 4,
    title: "QMS Audit 04",
    subtitle: "Receipt of Raw Materials and Components",
    items: [
      { srNo: "1", clause: "8.5.1", checkpoint: "Verification of incoming raw materials against PO specifications." }
    ]
  },
  5: {
    id: 5,
    title: "QMS Audit 05",
    subtitle: "Manufacturing",
    items: [
      { srNo: "1", clause: "8.5.1", checkpoint: "Control of production and service provision under specified conditions." }
    ]
  },
  6: {
    id: 6,
    title: "QMS Audit 06",
    subtitle: "Final Product",
    items: [
      { srNo: "1", clause: "8.6", checkpoint: "Release of products and services - evidence of conformity." }
    ]
  },
  7: {
    id: 7,
    title: "QMS Audit 07",
    subtitle: "Traceability and Supply Chain",
    items: [
      { srNo: "1", clause: "8.5.2", checkpoint: "Identification and traceability configurations across production outputs." }
    ]
  },
  8: {
    id: 8,
    title: "QMS Audit 08",
    subtitle: "Health Security",
    items: [
      { srNo: "1", clause: "7.1.4", checkpoint: "Environment for the operation of processes - social, psychological, and physical factors." }
    ]
  }
};
