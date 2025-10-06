import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const SectionWelcome = ({ section }) => {
  const displayName = section.charAt(0).toUpperCase() + section.slice(1);
  const [message, setMessage] = useState(`Welcome to ${displayName}`);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchMessage = async () => {
      setLoading(true);
      setError('');
      setMessage(`Welcome to ${displayName}`);

      const token = localStorage.getItem('authToken');

      if (!token) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/${section}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          window.location.replace('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Unable to fetch dashboard message');
        }

        const data = await response.json();

        if (isMounted && data?.message) {
          setMessage(data.message);
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
  }, [section, displayName]);

  return (
    <div className="section-welcome" role="status" aria-live="polite">
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
