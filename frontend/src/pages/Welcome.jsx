import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

// Simple welcome page shown after successful authentication.
const Welcome = () => {
  const { profile, logout } = useAuth();

  return (
    <div className="container">
      <h1>Welcome!</h1>
      <p>You are now logged in as {profile?.email}.</p>
      <button type="button" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

export default Welcome;
