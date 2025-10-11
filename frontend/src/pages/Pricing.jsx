import { useEffect, useMemo, useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import BrandLogo from '../components/BrandLogo.jsx';

const BILLING_OPTIONS = ['MONTHLY', 'QUARTERLY', 'YEARLY'];

const PLAN_DETAILS = {
  MONTHLY: {
    duration: '1 Month',
    price: '₹999/mo'
  },
  QUARTERLY: {
    duration: '3 Months',
    price: '₹316.35/mo'
  },
  YEARLY: {
    duration: '12 Months',
    price: '₹74.91/mo'
  }
};

const PLAN_FEATURES = [
  'insights of sales and revenue',
  'returns and settlements',
  'overview of account health',
  'Unlimited feature flags',
  'Web Experimentation',
  'Access to community and academy',
  'overall highlights and low lights of your account'
];

const navLinks = [
  { label: 'Home', href: '/login' },
  { label: 'Solutions', href: '#' },
  { label: 'Contact', href: '#' },
  { label: 'Pricing', href: '/pricing' }
];

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('YEARLY');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [displayCycle, setDisplayCycle] = useState('YEARLY');
  const [transitionState, setTransitionState] = useState('visible');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const { body } = document;

    if (isMenuOpen) {
      body.style.setProperty('overflow', 'hidden');
    } else {
      body.style.removeProperty('overflow');
    }

    return () => {
      body.style.removeProperty('overflow');
    };
  }, [isMenuOpen]);

  const navigationItems = useMemo(
    () =>
      navLinks.map((link) => ({
        ...link,
        isActive: link.href === '/pricing'
      })),
    []
  );

  const closeMenu = () => setIsMenuOpen(false);

  const handleOptionClick = (option) => {
    setBillingCycle(option);
  };

  useEffect(() => {
    if (billingCycle !== displayCycle && transitionState === 'visible') {
      setTransitionState('fade-out');
    }
  }, [billingCycle, displayCycle, transitionState]);

  useEffect(() => {
    let timeoutId;

    if (transitionState === 'fade-out') {
      timeoutId = setTimeout(() => {
        setDisplayCycle(billingCycle);
        setTransitionState('pre-fade-in');
      }, 260);
    } else if (transitionState === 'pre-fade-in') {
      timeoutId = setTimeout(() => {
        setTransitionState('fade-in');
      }, 20);
    } else if (transitionState === 'fade-in') {
      timeoutId = setTimeout(() => {
        setTransitionState('visible');
      }, 20);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [transitionState, billingCycle]);

  const planDetails = PLAN_DETAILS[displayCycle];

  return (
    <div className="pricing-page">
      <header className={`pricing-navbar ${isScrolled ? 'pricing-navbar-scrolled' : ''}`}>
        <div className="pricing-navbar-inner">
          <BrandLogo to="/pricing" className="pricing-logo" ariaLabel="Dashvio" />
          <nav className="pricing-nav" aria-label="Primary">
            {navigationItems.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`pricing-nav-link ${link.isActive ? 'active' : ''}`}
                aria-current={link.isActive ? 'page' : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pricing-actions">
            <a href="/login" className="pricing-login">Login</a>
            <a href="#contact-sales" className="pricing-cta">Contact Sales</a>
          </div>
          <button
            type="button"
            className="pricing-menu-toggle"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          </button>
        </div>
        <div className={`pricing-mobile-menu ${isMenuOpen ? 'open' : ''}`}>
          <button
            type="button"
            className="pricing-mobile-close"
            onClick={closeMenu}
            aria-label="Close navigation menu"
          >
            <FiX aria-hidden="true" />
          </button>
          <nav className="pricing-mobile-nav" aria-label="Mobile navigation">
            {navigationItems.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`pricing-mobile-link ${link.isActive ? 'active' : ''}`}
                aria-current={link.isActive ? 'page' : undefined}
                onClick={closeMenu}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pricing-mobile-actions">
            <a href="/login" className="pricing-login" onClick={closeMenu}>
              Login
            </a>
            <a href="#contact-sales" className="pricing-cta" onClick={closeMenu}>
              Contact Sales
            </a>
          </div>
        </div>
      </header>

      <main className="pricing-main">
        <section className="pricing-hero">
          <div className="pricing-hero-copy">
            <p className="eyebrow">Pricing</p>
            <h1>Find the right plan</h1>
            <p className="description">Pay for dashboards, not data sources.</p>
            <div className="pricing-frequency">
              {BILLING_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option}
                  className={`billing-option ${billingCycle === option ? 'active' : ''}`}
                  onClick={() => handleOptionClick(option)}
                  aria-pressed={billingCycle === option}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="pricing-hero-visual animated-bg" aria-hidden="true">
            <div className="pricing-ribbons" />
          </div>
        </section>
        <section className="pricing-plan-section" aria-live="polite">
          <div className="pricing-plan-area">
            <article className={`pricing-plan-card ${transitionState}`}>
              <header className="pricing-plan-header">
                <h2>{planDetails.duration}</h2>
                <p className="pricing-plan-subtext">Starting at</p>
              </header>
              <div className="pricing-plan-middle">
                <p className="pricing-plan-price">{planDetails.price}</p>
                <button type="button" className="pricing-card-cta">
                  Contact Sales
                </button>
              </div>
              <div className="pricing-plan-features">
                <p className="pricing-plan-included">What's included:</p>
                <ul className="pricing-plan-feature-list">
                  {PLAN_FEATURES.map((feature) => (
                    <li key={feature} className="feature">
                      <span aria-hidden="true">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Pricing;
