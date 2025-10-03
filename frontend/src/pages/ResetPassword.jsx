import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/reset-password-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const contentType = response.headers.get('content-type') || '';
      let data = null;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Unexpected response from the server.');
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to process password reset request.');
      }

      setStatus({
        type: 'success',
        message:
          data?.message ||
          'If an account matches that email, a reset link has been sent.'
      });
      setEmail('');
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email to receive a reset link"
      footer={
        <p>
          Remembered your password? <Link to="/login">Return to login</Link>
        </p>
      }
    >
      <form className="auth-form-body" onSubmit={handleSubmit}>
        <div className="form-control">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        {status.message && (
          <p className={`status-message ${status.type}`}>{status.message}</p>
        )}

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
