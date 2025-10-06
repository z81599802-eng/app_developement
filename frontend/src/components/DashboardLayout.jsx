import { useEffect, useState } from 'react';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const navigationItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Performance', path: '/dashboard/performance' },
  { label: 'Revenue', path: '/dashboard/revenue' }
];

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifyAccess = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        if (isMounted) {
          setCheckingAuth(false);
        }
        navigate('/login', { replace: true });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/status`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Unable to verify dashboard access');
        }
      } catch (error) {
        console.error(error);
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        navigate('/login', { replace: true });
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    };

    verifyAccess();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    navigate('/login', { replace: true });
  };

  if (checkingAuth) {
    return <div className="dashboard-loading">Preparing your dashboard…</div>;
  }

  return (
    <div className="dashboard-layout">
      <aside
        id="dashboard-sidebar"
        className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}
      >
        <div className="sidebar-header">
          <img src={logo} alt="App logo" className="sidebar-logo" />
          <button
            type="button"
            className="mobile-close-button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <FiX />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          <FiLogOut aria-hidden="true" />
          <span>Logout</span>
        </button>
      </aside>

      <div
        className={`dashboard-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        role="presentation"
      />

      <div className="dashboard-content">
        <header className="dashboard-mobile-header">
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-expanded={sidebarOpen}
            aria-controls="dashboard-sidebar"
          >
            {sidebarOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
            <span className="sr-only">Toggle navigation</span>
          </button>
          <img src={logo} alt="App logo" className="mobile-logo" />
          <button
            type="button"
            className="mobile-logout-button"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <FiLogOut aria-hidden="true" />
          </button>
        </header>

        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
