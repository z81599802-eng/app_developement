import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import WelcomePage from './pages/WelcomePage.jsx';

// A thin wrapper around routes that ensures a valid session token exists.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// The root component wires together the auth provider and route tree.
const App = () => (
  <AuthProvider>
    <div className="app-container">
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route
          path="/welcome"
          element={
            <ProtectedRoute>
              <WelcomePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  </AuthProvider>
);

export default App;
