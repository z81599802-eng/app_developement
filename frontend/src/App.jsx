import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm.jsx';
import SignupForm from './components/SignupForm.jsx';
import Welcome from './pages/Welcome.jsx';
import { useAuth } from './context/AuthContext.jsx';

// Wrapper component that only renders children when a user is authenticated.
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Defines the client-side routing for the authentication flow.
const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<LoginForm />} />
    <Route path="/signup" element={<SignupForm />} />
    <Route
      path="/welcome"
      element={
        <PrivateRoute>
          <Welcome />
        </PrivateRoute>
      }
    />
  </Routes>
);

export default App;
