import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Authentication page that presents a combined login/signup form.
const AuthPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handles changes for both the email and password inputs.
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Swap the UI between signup and login modes.
  const toggleMode = () => {
    setError('');
    setSuccess('');
    setIsSignup((prev) => !prev);
  };

  // Submit handler that calls either the signup or login endpoint based on the mode.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = isSignup ? '/signup' : '/login';
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, formData);

      if (isSignup) {
        setSuccess('Signup successful! You can now log in.');
        setIsSignup(false);
        setFormData({ email: formData.email, password: '' });
      } else {
        const { token } = response.data;
        login(token);
        navigate('/welcome');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email address"
          required
          autoComplete="email"
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
          minLength={8}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <p className="toggle">
        {isSignup ? 'Already have an account?' : "Don't have an account?"}
        <button type="button" onClick={toggleMode} disabled={isSubmitting} className="link-button">
          {isSignup ? 'Log in' : 'Sign up'}
        </button>
      </p>
    </div>
  );
};

export default AuthPage;
