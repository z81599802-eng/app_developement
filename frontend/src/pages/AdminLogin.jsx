import { useMemo, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const adminBaseUrl = useMemo(() => {
    const normalized = API_BASE_URL.replace(/\/?api\/?$/, '');
    return normalized === API_BASE_URL ? '' : normalized;
  }, []);
  const [formData, setFormData] = useState({
    adminName: '',
    email: '',
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
      const response = await fetch(`${adminBaseUrl}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminName: formData.adminName,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to sign in.');
      }

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminProfile', JSON.stringify(data.admin));

      if (!formData.remember) {
        sessionStorage.setItem('adminToken', data.token);
        sessionStorage.setItem('adminProfile', JSON.stringify(data.admin));
      } else {
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminProfile');
      }

      setStatus({ type: 'success', message: 'Login successful.' });
      navigate('/admin/createuserAccount', { replace: true });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Admin Sign In"
      subtitle="Access the admin console"
      footer={
        <p>
          Need to create an admin? <Link to="/admin/signup">Use your admin token</Link>
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
          <label htmlFor="password">Password</label>
          <div className="password-field">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter admin password"
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
          <Link className="reset-link" to="/login">
            Back to user login
          </Link>
        </div>

        {status.message && (
          <p className={`status-message ${status.type}`}>{status.message}</p>
        )}

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Signing In…' : 'Login as Admin'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default AdminLoginPage;
