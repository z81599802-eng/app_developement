import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Signup form that allows new users to register and automatically log in.
const SignupForm = () => {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await signup(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />

        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Create a strong password"
          required
        />

        <label htmlFor="signup-confirm">Confirm Password</label>
        <input
          id="signup-confirm"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Re-enter your password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign Up'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <p>
        Already registered? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default SignupForm;
