import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx';
import DashboardPage from './pages/Dashboard.jsx';
import LoginPage from './pages/Login.jsx';
import PerformancePage from './pages/Performance.jsx';
import ResetPasswordPage from './pages/ResetPassword.jsx';
import RevenuePage from './pages/Revenue.jsx';
import AdminLoginPage from './pages/AdminLogin.jsx';
import AdminSignupPage from './pages/AdminSignup.jsx';
import AdminCreateUserAccountPage from './pages/AdminCreateUserAccount.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/signup" element={<AdminSignupPage />} />
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin/createuserAccount" element={<AdminCreateUserAccountPage />} />
      </Route>
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
