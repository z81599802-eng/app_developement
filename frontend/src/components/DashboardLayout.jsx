import { useEffect, useMemo, useState } from 'react';
import { FiLogOut, FiSidebar } from 'react-icons/fi';
import { LuIndianRupee, LuLayoutDashboard, LuTrendingUp } from 'react-icons/lu';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const navigationItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LuLayoutDashboard },
  { label: 'Performance', path: '/dashboard/performance', icon: LuTrendingUp },
  { label: 'Revenue', path: '/dashboard/revenue', icon: LuIndianRupee }
];

const MOBILE_BREAKPOINT = 1024;

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

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
    const handleResize = () => {
      const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobileViewport(isMobile);
      if (isMobile) {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    setIsCollapsed(false);
  }, [location.pathname]);

  const navItems = useMemo(
    () =>
      navigationItems.map((item) => ({
        ...item,
        title: item.label
      })),
    []
  );

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    navigate('/login', { replace: true });
  };

  const handleToggle = () => {
    if (isMobileViewport) {
      return;
    }

    setIsCollapsed((prev) => !prev);
  };

  if (checkingAuth) {
    return <div className="dashboard-loading">Preparing your dashboard…</div>;
  }

  return (
    <div className={`dashboard-shell ${isCollapsed ? 'collapsed' : ''}`}>
      <aside className={`dashboard-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand" aria-label="Application logo">
            <img src={logo} alt="App logo" className="sidebar-logo" />
          </div>

          <button
            type="button"
            className="sidebar-toggle"
            onClick={handleToggle}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-pressed={isCollapsed}
            disabled={isMobileViewport}
          >
            <FiSidebar aria-hidden="true" />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `sidebar-nav-link ${isActive ? 'active' : ''}`
                }
                aria-label={isCollapsed ? item.title : undefined}
                data-tooltip={item.title}
              >
                <span className="sidebar-icon" aria-hidden="true">
                  <Icon />
                </span>
                {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
          aria-label={isCollapsed ? 'Logout' : undefined}
          data-tooltip="Logout"
        >
          <FiLogOut aria-hidden="true" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </aside>

      <section className="dashboard-main-area">
        {!isMobileViewport && isCollapsed && (
          <div className="dashboard-floating-logo">
            <img src={logo} alt="App logo" />
          </div>
        )}
        <main className="dashboard-main-content">
          <Outlet />
        </main>
      </section>
    </div>
  );
};

export default DashboardLayout;
