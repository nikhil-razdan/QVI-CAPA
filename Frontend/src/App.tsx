import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.tsx";
import AdminCalendar from "./pages/AdminCalendar.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import FormsManagement from "./pages/FormsManagement.tsx";
import FormContainer from "./components/FormContainer.tsx";
import AuditStart from "./pages/AuditStart.tsx";
import AuditManagement from "./pages/AuditManagement.tsx";
import FormMaster from "./pages/FormMaster.tsx";
import LevelPicker from "./pages/LevelPicker.tsx";
import CompanyMaster from "./pages/CompanyMaster.tsx";
import AuditorMaster from "./pages/AuditorMaster.tsx";
import AuditEmbed from "./pages/AuditEmbed.tsx";
import CreateAudit from "./pages/CreateAudit.tsx";
import AuditVerifyGateway from "./pages/AuditVerifyGateway.tsx"; // Import gateway

const ProtectedRoute = ({ children }: { children: React.JSX.Element }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const P = ({ children }: { children: React.JSX.Element }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<P><Dashboard /></P>} />

        <Route path="/forms" element={<P><FormsManagement /></P>} />
        <Route path="/forms/:id" element={<P><FormContainer /></P>} />

        <Route path="/audit-management" element={<P><AuditManagement /></P>} />
        <Route path="/audit-management/form-master" element={<P><FormMaster /></P>} />
        <Route path="/audit-management/form-master/:formId/level" element={<P><LevelPicker /></P>} />
        <Route path="/audit-management/form-master/:formId/level/:level" element={<P><AuditStart /></P>} />
        <Route path="/audit-management/form-master/:formId/level/:level/embed" element={<P><AuditEmbed /></P>} />
        <Route path="/audit-management/company-master" element={<P><CompanyMaster /></P>} />
        <Route path="/audit-management/auditor-master" element={<P><AuditorMaster /></P>} />
        <Route path="/audit-management/create-audit" element={<P><CreateAudit /></P>} />
        <Route path="/audit-management/calendar" element={<P><AdminCalendar /></P>} />

        {/* PUBLIC SECURE GATEWAY FOR AUDITORS MORNING VERIFICATION NODE */}
        <Route path="/audit-verification/gateway" element={<AuditVerifyGateway />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
