import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Login.jsx';
import SignupPage from './pages/Signup.jsx';
import ResetPasswordPage from './pages/ResetPassword.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
