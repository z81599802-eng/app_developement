import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Protected welcome page that fetches the user profile using the stored JWT.
const WelcomePage = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProfile(response.data);
      } catch (err) {
        setError('Session expired. Please log in again.');
        logout();
        navigate('/', { replace: true });
      }
    };

    fetchProfile();
  }, [token, logout, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="card">
      <h1>Welcome!</h1>
      {profile ? (
        <>
          <p className="success-message">You are logged in as {profile.email}.</p>
          <p>Account created on: {new Date(profile.created_at).toLocaleString()}</p>
        </>
      ) : (
        !error && <p>Loading profile…</p>
      )}
      {error && <p className="error-message">{error}</p>}
      <button type="button" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
};

export default WelcomePage;
