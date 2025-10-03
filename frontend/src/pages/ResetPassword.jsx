import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const isTokenFlow = Boolean(token);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });

  const parseJsonResponse = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      if (isTokenFlow) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        const response = await fetch(`${API_BASE_URL}/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password, confirmPassword })
        });

        const data = await parseJsonResponse(response);

        if (!response.ok) {
          throw new Error(data?.message || 'Unable to reset password.');
        }

        setStatus({
          type: 'success',
          message:
            data?.message || 'Your password has been reset successfully. You can now sign in.'
        });
        setPassword('');
        setConfirmPassword('');
      } else {
        const response = await fetch(`${API_BASE_URL}/reset-password-request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const data = await parseJsonResponse(response);

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
      }
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
      title={isTokenFlow ? 'Reset Password' : 'Forgot Password'}
      subtitle={
        isTokenFlow
          ? 'Create a new password for your account.'
          : 'Enter your email to receive a reset link'
      }
      footer={
        <p>
          Remembered your password? <Link to="/login">Return to login</Link>
        </p>
      }
    >
      <form className="auth-form-body" onSubmit={handleSubmit}>
        {isTokenFlow ? (
          <>
            <div className="form-control">
              <label htmlFor="password">New Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter a new password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />
            </div>

            <div className="form-control">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={6}
                required
              />
            </div>
          </>
        ) : (
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
        )}

        {status.message && (
          <p className={`status-message ${status.type}`}>{status.message}</p>
        )}

        <button type="submit" className="primary-button" disabled={loading}>
          {loading
            ? isTokenFlow
              ? 'Resetting…'
              : 'Sending…'
            : isTokenFlow
            ? 'Reset Password'
            : 'Send Reset Link'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
