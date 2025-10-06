import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardPage from './pages/Dashboard.jsx';
import LoginPage from './pages/Login.jsx';
import PerformancePage from './pages/Performance.jsx';
import ResetPasswordPage from './pages/ResetPassword.jsx';
import RevenuePage from './pages/Revenue.jsx';
import SignupPage from './pages/Signup.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="performance" element={<PerformancePage />} />
          <Route path="revenue" element={<RevenuePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
