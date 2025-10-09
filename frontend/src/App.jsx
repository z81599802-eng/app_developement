import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const DashboardLayout = lazy(() => import('./components/DashboardLayout.jsx'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute.jsx'));
const AdminProtectedRoute = lazy(() => import('./components/AdminProtectedRoute.jsx'));

const DashboardPage = lazy(() => import('./pages/Dashboard.jsx'));
const PerformancePage = lazy(() => import('./pages/Performance.jsx'));
const RevenuePage = lazy(() => import('./pages/Revenue.jsx'));

const LoginPage = lazy(() => import('./pages/Login.jsx'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPassword.jsx'));

const AdminLoginPage = lazy(() => import('./pages/AdminLogin.jsx'));
const AdminSignupPage = lazy(() => import('./pages/AdminSignup.jsx'));
const AdminCreateUserAccountPage = lazy(() => import('./pages/AdminCreateUserAccount.jsx'));

const App = () => {
  return (
    <Suspense fallback={<div className="app-suspense">Loading experience…</div>}>
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
    </Suspense>
  );
};

export default App;
