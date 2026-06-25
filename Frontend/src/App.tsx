import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import FormsManagement from "./pages/FormsManagement.tsx";
import FormContainer from "./components/FormContainer.tsx";
import AuditPage1 from "./pages/AuditPage1.tsx";
import AuditManagement from "./pages/AuditManagement.tsx";
import FormMaster from "./pages/FormMaster.tsx";
import LevelPicker from "./pages/LevelPicker.tsx";
import CompanyMaster from "./pages/CompanyMaster.tsx";
import AuditorMaster from "./pages/AuditorMaster.tsx";
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
        <Route path="/audit-management/form-master/1/level/1" element={<P><AuditPage1 /></P>} />
        <Route path="/audit-management/company-master" element={<P><CompanyMaster /></P>} />
        <Route path="/audit-management/auditor-master" element={<P><AuditorMaster /></P>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
