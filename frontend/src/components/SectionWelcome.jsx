import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const SectionWelcome = ({ section }) => {
  const displayName = section.charAt(0).toUpperCase() + section.slice(1);
  const [message, setMessage] = useState(`Welcome to ${displayName}`);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);

  const endpoints = useMemo(
    () => ({
      dashboard: `${API_BASE_URL}/dashboard`,
      performance: `${API_BASE_URL}/performance`,
      revenue: `${API_BASE_URL}/revenue`
    }),
    []
  );

  useEffect(() => {
    let isMounted = true;

    const fetchMessage = async () => {
      setLoading(true);
      setError('');
      setMessage(`Welcome to ${displayName}`);
      setAnimate(true);

      const token = localStorage.getItem('authToken');

      if (!token) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      const resolveResponse = async (response) => {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          window.location.replace('/login');
          return false;
        }

        if (!response.ok) {
          throw new Error('Unable to fetch dashboard message');
        }

        const data = await response.json();

        if (isMounted && data?.message) {
          setMessage(data.message);
        }

        return true;
      };

      try {
        const targetEndpoint = endpoints[section] || `${API_BASE_URL}/dashboard/${section}`;
        const fallbackEndpoint = `${API_BASE_URL}/dashboard/${section}`;

        const fetchWithAuth = (url) =>
          fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

        let response = await fetchWithAuth(targetEndpoint);

        if (
          response.status !== 401 &&
          !response.ok &&
          targetEndpoint !== fallbackEndpoint
        ) {
          response = await fetchWithAuth(fallbackEndpoint);
        }

        const handled = await resolveResponse(response);

        if (!handled) {
          return;
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Unable to load the latest welcome message.');
          setMessage(`Welcome to ${displayName}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMessage();

    return () => {
      isMounted = false;
    };
  }, [section, displayName, endpoints]);

  useEffect(() => {
    if (!animate) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setAnimate(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [animate]);

  return (
    <div
      className={`section-welcome ${animate ? 'section-welcome-animate' : ''}`}
      role="status"
      aria-live="polite"
    >
      <h1>{message}</h1>
      {loading ? (
        <p className="section-subtitle">Preparing insights for your {displayName.toLowerCase()}.</p>
      ) : error ? (
        <p className="section-error">{error}</p>
      ) : (
        <p className="section-subtitle">Here&apos;s where you can track your {displayName.toLowerCase()} metrics.</p>
      )}
    </div>
  );
};

SectionWelcome.propTypes = {
  section: PropTypes.oneOf(['dashboard', 'performance', 'revenue']).isRequired
};

export default SectionWelcome;
