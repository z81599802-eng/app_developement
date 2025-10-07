import { useEffect, useMemo, useState } from 'react';
import { FiLogOut, FiMenu, FiSidebar, FiX } from 'react-icons/fi';
import { LuIndianRupee, LuLayoutDashboard, LuTrendingUp } from 'react-icons/lu';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const navigationItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LuLayoutDashboard },
  { label: 'Performance', path: '/dashboard/performance', icon: LuTrendingUp },
  { label: 'Revenue', path: '/dashboard/revenue', icon: LuIndianRupee }
];

const MOBILE_BREAKPOINT = 1024;

const getStoredSidebarPreference = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return localStorage.getItem('dashboardSidebarCollapsed') === 'true';
};

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(() => getStoredSidebarPreference());
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.innerWidth <= MOBILE_BREAKPOINT;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        setIsMobileMenuOpen(false);
      } else {
        setIsCollapsed(getStoredSidebarPreference());
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const navItems = useMemo(
    () =>
      navigationItems.map((item) => ({
        ...item,
        title: item.label
      })),
    []
  );

  const persistCollapsedState = (collapsed) => {
    setIsCollapsed(collapsed);

    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboardSidebarCollapsed', collapsed ? 'true' : 'false');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    if (isMobileViewport) {
      setIsMobileMenuOpen(false);
    }
    navigate('/login', { replace: true });
  };

  const handleToggle = () => {
    if (isMobileViewport) {
      return;
    }

    persistCollapsedState(!isCollapsed);
  };

  const handleMobileMenuToggle = () => {
    if (!isMobileViewport) {
      return;
    }

    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleCloseMobileMenu = () => {
    if (!isMobileViewport) {
      return;
    }

    setIsMobileMenuOpen(false);
  };

  if (checkingAuth) {
    return <div className="dashboard-loading">Preparing your dashboard…</div>;
  }

  const collapsedForDesktop = !isMobileViewport && isCollapsed;

  return (
    <div
      className={`dashboard-shell ${collapsedForDesktop ? 'collapsed' : ''} ${
        isMobileViewport ? 'mobile' : ''
      } ${isMobileViewport && isMobileMenuOpen ? 'mobile-open' : ''}`}
    >
      {isMobileViewport && (
        <header className="dashboard-mobile-header">
          <div className="mobile-header-logo" aria-label="Application logo">
            <img src={logo} alt="App logo" />
          </div>

          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={handleMobileMenuToggle}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close sidebar menu' : 'Open sidebar menu'}
          >
            {isMobileMenuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          </button>
        </header>
      )}

      <aside
        className={`dashboard-sidebar ${collapsedForDesktop ? 'collapsed' : ''} ${
          isMobileViewport ? 'mobile' : ''
        } ${isMobileViewport && isMobileMenuOpen ? 'open' : ''}`}
      >
        <div className="sidebar-top">
          {(!collapsedForDesktop || isMobileViewport) && (
            <div className="sidebar-brand" aria-label="Application logo">
              <img src={logo} alt="App logo" className="sidebar-logo" />
            </div>
          )}

          {!isMobileViewport && (
            <button
              type="button"
              className="sidebar-toggle"
              onClick={handleToggle}
              aria-label={collapsedForDesktop ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-pressed={collapsedForDesktop}
            >
              <FiSidebar aria-hidden="true" />
            </button>
          )}
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
                aria-label={collapsedForDesktop ? item.title : undefined}
                data-tooltip={collapsedForDesktop ? item.title : undefined}
                onClick={handleCloseMobileMenu}
              >
                <span className="sidebar-icon" aria-hidden="true">
                  <Icon />
                </span>
                {!collapsedForDesktop && <span className="sidebar-label">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
          aria-label={collapsedForDesktop ? 'Logout' : undefined}
          data-tooltip={collapsedForDesktop ? 'Logout' : undefined}
        >
          <FiLogOut aria-hidden="true" />
          {!collapsedForDesktop && <span>Logout</span>}
        </button>
      </aside>

      {isMobileViewport && (
        <div
          className={`dashboard-overlay ${isMobileMenuOpen ? 'visible' : ''}`}
          aria-hidden="true"
          onClick={handleCloseMobileMenu}
        />
      )}

      <section className="dashboard-main-area">
        <main className="dashboard-main-content">
          <Outlet />
        </main>
      </section>
    </div>
  );
};

export default DashboardLayout;
