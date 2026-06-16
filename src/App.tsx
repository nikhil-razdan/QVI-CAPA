import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import FormsManagement from "./pages/FormsManagement.tsx";

// Abhi localStorage, baad mein make it JWT atleast
const ProtectedRoute = ({ children }: { children: React.JSX.Element }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forms"
          element={
            <ProtectedRoute>
              <FormsManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
