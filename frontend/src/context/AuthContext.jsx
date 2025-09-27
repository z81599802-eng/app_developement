import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// API base URL can be configured via environment variables when running Vite.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [profile, setProfile] = useState(null);

  // Whenever the token changes, persist it in localStorage so that
  // the session survives page refreshes.
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Helper to perform authenticated fetch requests to the backend.
  const authFetch = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || 'Request failed');
    }

    return response.json();
  };

  // Authenticate the user by sending credentials to the backend login route.
  const login = async (email, password) => {
    const data = await authFetch('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' }
    });
    setToken(data.token);
    setProfile(data.user);
    navigate('/welcome');
  };

  // Create a new user on the backend and reuse the login flow for convenience.
  const signup = async (email, password) => {
    await authFetch('/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' }
    });
    await login(email, password);
  };

  // Clear authentication state and return to the login page.
  const logout = () => {
    setToken(null);
    setProfile(null);
    navigate('/login');
  };

  // Fetch the authenticated user's profile if a token is already stored.
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setProfile(null);
        return;
      }
      try {
        const data = await authFetch('/profile', { method: 'GET' });
        setProfile(data.user);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        logout();
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      profile,
      isAuthenticated: Boolean(token),
      login,
      signup,
      logout
    }),
    [token, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
