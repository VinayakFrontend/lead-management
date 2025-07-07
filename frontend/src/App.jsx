import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import LeadDashboard from './pages/LeadDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Super Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['super-admin']} />}>
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
      </Route>

      {/* Sub Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['sub-admin']} />}>
        <Route path="/sub-admin" element={<h2>Support Agent Dashboard</h2>} />
      </Route>

      {/* Support Agent Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['support-agent']} />}>
        <Route path="/support-agent" element={<h2>Support Agent Dashboard</h2>} />
      </Route>

      {/* Catch-all fallback */}
{/*       <Route path="*" element={<Navigate to="/login" />} /> */}
      <Route path="/leads" element={<LeadDashboard />} />
      <Route path="/analytics" element={<AnalyticsDashboard />} />
    </Routes>
  );
}

export default App;
