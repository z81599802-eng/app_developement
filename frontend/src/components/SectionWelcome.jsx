import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const SectionWelcome = ({ section }) => {
  const displayName = section.charAt(0).toUpperCase() + section.slice(1);
  const [message, setMessage] = useState(`Welcome to ${displayName}`);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');

  const getStoredProfile = useMemo(
    () => () => {
      const storedProfile =
        localStorage.getItem('userProfile') || sessionStorage.getItem('userProfile');

      if (!storedProfile) {
        return null;
      }

      try {
        return JSON.parse(storedProfile);
      } catch (parseError) {
        console.error('Unable to parse stored user profile', parseError);
        return null;
      }
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    const fetchMessage = async () => {
      setLoading(true);
      setError('');
      setMessage(`Welcome to ${displayName}`);
      setIframeUrl('');
      setAnimate(true);

      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      if (!token) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      const profile = getStoredProfile();

      if (!profile?.email) {
        if (isMounted) {
          setError('Unable to determine the logged in user.');
          setLoading(false);
        }
        return;
      }

      const resolveResponse = async (response) => {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          localStorage.removeItem('userProfile');
          sessionStorage.removeItem('userProfile');
          window.location.replace('/login');
          return false;
        }

        if (!response.ok) {
          throw new Error('Unable to fetch dashboard content');
        }

        const data = await response.json();

        if (isMounted) {
          if (data?.link) {
            setIframeUrl(data.link);
          }

          if (data?.message) {
            setMessage(data.message);
          }
        }

        return true;
      };

      try {
        const response = await fetch(
          `${API_BASE_URL}/dashboardlinks?email=${encodeURIComponent(profile.email)}&page=${section}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.status === 404) {
          await resolveResponse(
            new Response(
              JSON.stringify({ message: `Welcome to ${displayName}` }),
              { status: 200, headers: { 'Content-Type': 'application/json' } }
            )
          );
          return;
        }

        const handled = await resolveResponse(response);

        if (!handled) {
          return;
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Unable to load the latest dashboard content.');
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
  }, [section, displayName, getStoredProfile]);

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
      {iframeUrl ? (
        <iframe
          title={`${displayName} insights`}
          src={iframeUrl}
          className="dashboard-iframe"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      ) : (
        <>
          <h1>{message}</h1>
          {loading ? (
            <p className="section-subtitle">
              Preparing insights for your {displayName.toLowerCase()}.
            </p>
          ) : error ? (
            <p className="section-error">{error}</p>
          ) : (
            <p className="section-subtitle">
              Here&apos;s where you can track your {displayName.toLowerCase()} metrics.
            </p>
          )}
        </>
      )}
    </div>
  );
};

SectionWelcome.propTypes = {
  section: PropTypes.oneOf(['dashboard', 'performance', 'revenue']).isRequired
};

export default SectionWelcome;
