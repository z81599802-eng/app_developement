import { useMemo, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import resolveAdminBaseUrl from '../utils/resolveAdminBaseUrl.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const AdminSignupPage = () => {
  const navigate = useNavigate();
  const adminBaseUrl = useMemo(() => resolveAdminBaseUrl(API_BASE_URL), []);
  const [formData, setFormData] = useState({
    adminName: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCreationToken: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: null, message: '' });

    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${adminBaseUrl}/admin/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminName: formData.adminName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          adminCreationToken: formData.adminCreationToken
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to create admin account.');
      }

      setStatus({ type: 'success', message: 'Admin account created. Redirecting to login…' });
      setTimeout(() => {
        navigate('/admin/login', { replace: true });
      }, 900);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Admin Account"
      subtitle="Provide the admin creation token to continue"
      footer={
        <p>
          Already have an admin account? <Link to="/admin/login">Sign in</Link>
        </p>
      }
    >
      <form className="auth-form-body" onSubmit={handleSubmit}>
        <div className="form-control">
          <label htmlFor="adminName">Admin Name</label>
          <input
            id="adminName"
            name="adminName"
            type="text"
            placeholder="Enter admin name"
            value={formData.adminName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-control">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter admin email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-control">
          <label htmlFor="password">Create Password</label>
          <div className="password-field">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
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

        <div className="form-control">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="password-field">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <div className="form-control">
          <label htmlFor="adminCreationToken">Admin Creation Token</label>
          <input
            id="adminCreationToken"
            name="adminCreationToken"
            type="password"
            placeholder="Enter admin token"
            value={formData.adminCreationToken}
            onChange={handleChange}
            required
          />
        </div>

        {status.message && (
          <p className={`status-message ${status.type}`}>{status.message}</p>
        )}

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Creating…' : 'Create Admin Account'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default AdminSignupPage;
