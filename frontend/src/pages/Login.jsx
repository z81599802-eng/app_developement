import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    remember: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: formData.identifier,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to sign in.');
      }

      const storage = formData.remember ? localStorage : sessionStorage;
      storage.setItem('authToken', data.token);

      setStatus({ type: 'success', message: 'Login successful! Token stored.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Please sign in to continue"
      footer={
        <p>
          New on our platform? <Link to="/signup">Create an account</Link>
        </p>
      }
    >
      <form className="auth-form-body" onSubmit={handleSubmit}>
        <div className="form-control">
          <label htmlFor="identifier">Email or Mobile Number</label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            placeholder="Enter your email or mobile"
            value={formData.identifier}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-control">
          <label htmlFor="password">Password</label>
          <div className="password-field">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <div className="form-options">
          <label className="checkbox">
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
            />
            Remember Me
          </label>
          <a className="reset-link" href="/reset-password">
            Reset Password?
          </a>
        </div>

        {status.message && (
          <p className={`status-message ${status.type}`}>{status.message}</p>
        )}

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Signing In…' : 'Login'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
