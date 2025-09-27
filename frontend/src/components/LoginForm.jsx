import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Login form that captures user credentials and invokes the context login method.
const LoginForm = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Login'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <p>
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </div>
  );
};

export default LoginForm;
