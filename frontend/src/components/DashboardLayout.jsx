import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiLogOut, FiMenu, FiSidebar, FiX } from 'react-icons/fi';
import { LuIndianRupee, LuLayoutDashboard, LuTrendingUp } from 'react-icons/lu';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo.jsx';

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

const Sidebar = memo(
  ({
    collapsed,
    isMobile,
    isMobileMenuOpen,
    navItems,
    onToggle,
    onLogout,
    onCloseMobileMenu
  }) => {
    const sidebarClassName = useMemo(() => {
      const classes = ['dashboard-sidebar'];

      if (collapsed) {
        classes.push('collapsed');
      }

      if (isMobile) {
        classes.push('mobile');
      }

      if (isMobile && isMobileMenuOpen) {
        classes.push('open');
      }

      return classes.join(' ');
    }, [collapsed, isMobile, isMobileMenuOpen]);

    const tooltipEnabled = collapsed && !isMobile;

    return (
      <aside className={sidebarClassName}>
        <div className="sidebar-top">
          {(!collapsed || isMobile) && (
            <div className="sidebar-brand" aria-label="Dashvio">
              <BrandLogo className="sidebar-logo" to="/pricing" ariaLabel="Dashvio" />
            </div>
          )}

          {!isMobile && (
            <button
              type="button"
              className="sidebar-toggle"
              onClick={onToggle}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-pressed={collapsed}
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
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                aria-label={collapsed ? item.title : undefined}
                onClick={onCloseMobileMenu}
              >
                <span className="sidebar-icon" aria-hidden="true">
                  <Icon />
                </span>
                {!collapsed && <span className="sidebar-label">{item.label}</span>}
                {tooltipEnabled && (
                  <span className="sidebar-tooltip tooltip" role="tooltip">
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          className="sidebar-logout"
          onClick={onLogout}
          aria-label={collapsed ? 'Logout' : undefined}
        >
          <FiLogOut aria-hidden="true" />
          {!collapsed && <span>Logout</span>}
          {tooltipEnabled && (
            <span className="sidebar-tooltip tooltip" role="tooltip">
              Logout
            </span>
          )}
        </button>
      </aside>
    );
  }
);

Sidebar.displayName = 'DashboardSidebar';

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
  const collapseAnimationRef = useRef(null);
  const mobileMenuAnimationRef = useRef(null);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const htmlElement = document.documentElement;
    const bodyElement = document.body;

    htmlElement.classList.add('dashboard-active');
    bodyElement.classList.add('dashboard-active');

    return () => {
      htmlElement.classList.remove('dashboard-active');
      bodyElement.classList.remove('dashboard-active');
    };
  }, []);

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

  const persistCollapsedState = useCallback((collapsed) => {
    setIsCollapsed(collapsed);

    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboardSidebarCollapsed', collapsed ? 'true' : 'false');
    }
  }, []);

  const scheduleCollapse = useCallback(
    (nextCollapsedState) => {
      if (typeof window === 'undefined') {
        persistCollapsedState(nextCollapsedState);
        return;
      }

      if (collapseAnimationRef.current) {
        cancelAnimationFrame(collapseAnimationRef.current);
      }

      collapseAnimationRef.current = window.requestAnimationFrame(() => {
        persistCollapsedState(nextCollapsedState);
        collapseAnimationRef.current = null;
      });
    },
    [persistCollapsedState]
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userProfile');

    if (isMobileViewport) {
      setIsMobileMenuOpen(false);
    }

    navigate('/login', { replace: true });
  }, [isMobileViewport, navigate]);

  const handleToggle = useCallback(() => {
    if (isMobileViewport) {
      return;
    }

    scheduleCollapse(!isCollapsed);
  }, [isCollapsed, isMobileViewport, scheduleCollapse]);

  const updateMobileMenu = useCallback((open) => {
    if (!isMobileViewport) {
      return;
    }

    if (mobileMenuAnimationRef.current) {
      cancelAnimationFrame(mobileMenuAnimationRef.current);
    }

    mobileMenuAnimationRef.current = window.requestAnimationFrame(() => {
      setIsMobileMenuOpen(open);
      mobileMenuAnimationRef.current = null;
    });
  }, [isMobileViewport]);

  const handleMobileMenuToggle = useCallback(() => {
    updateMobileMenu(!isMobileMenuOpen);
  }, [isMobileMenuOpen, updateMobileMenu]);

  const handleCloseMobileMenu = useCallback(() => {
    updateMobileMenu(false);
  }, [updateMobileMenu]);

  useEffect(() => {
    if (!isMobileViewport || typeof document === 'undefined') {
      return undefined;
    }

    const { body } = document;

    if (isMobileMenuOpen) {
      body.style.setProperty('overflow', 'hidden');
    } else {
      body.style.removeProperty('overflow');
    }

    return () => {
      body.style.removeProperty('overflow');
    };
  }, [isMobileMenuOpen, isMobileViewport]);

  useEffect(
    () => () => {
      if (collapseAnimationRef.current) {
        cancelAnimationFrame(collapseAnimationRef.current);
      }

      if (mobileMenuAnimationRef.current) {
        cancelAnimationFrame(mobileMenuAnimationRef.current);
      }
    },
    []
  );

  if (checkingAuth) {
    return <div className="dashboard-loading">Preparing your dashboard…</div>;
  }

  const collapsedForDesktop = !isMobileViewport && isCollapsed;
  const shellClassName = useMemo(() => {
    const classes = ['dashboard-shell'];

    if (collapsedForDesktop) {
      classes.push('collapsed');
    }

    if (isMobileViewport) {
      classes.push('mobile');
    }

    if (isMobileViewport && isMobileMenuOpen) {
      classes.push('mobile-open');
    }

    return classes.join(' ');
  }, [collapsedForDesktop, isMobileMenuOpen, isMobileViewport]);

  return (
    <div className={shellClassName}>
      {isMobileViewport && (
        <header className="dashboard-mobile-header">
          <div className="mobile-header-logo" aria-label="Dashvio">
            <BrandLogo className="sidebar-logo" to="/pricing" ariaLabel="Dashvio" />
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

      {!isMobileViewport && (
        <Sidebar
          collapsed={collapsedForDesktop}
          isMobile={isMobileViewport}
          isMobileMenuOpen={isMobileMenuOpen}
          navItems={navItems}
          onToggle={handleToggle}
          onLogout={handleLogout}
          onCloseMobileMenu={handleCloseMobileMenu}
        />
      )}

      {isMobileViewport && (
        <div
          className={`dashboard-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="dashboard-mobile-menu-header">
            <BrandLogo className="sidebar-logo" to="/pricing" ariaLabel="Dashvio" />
            <button
              type="button"
              className="dashboard-mobile-close"
              onClick={handleCloseMobileMenu}
              aria-label="Close sidebar menu"
            >
              <FiX aria-hidden="true" />
            </button>
          </div>

          <nav className="dashboard-mobile-nav" aria-label="Dashboard navigation">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) => `dashboard-mobile-link ${isActive ? 'active' : ''}`}
                  onClick={handleCloseMobileMenu}
                >
                  <span className="dashboard-mobile-icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <span className="dashboard-mobile-label">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <button type="button" className="dashboard-mobile-logout" onClick={handleLogout}>
            <span className="dashboard-mobile-icon" aria-hidden="true">
              <FiLogOut />
            </span>
            <span className="dashboard-mobile-label">Logout</span>
          </button>
        </div>
      )}

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
