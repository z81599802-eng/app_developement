import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';
import demoImage from '../assets/demo-image.svg';

const AuthLayout = ({ title, subtitle, children, footer }) => {
  return (
    <div className="auth-container">
      <div className="auth-brand-logo">
        <Link to="/">
          <img src={logo} alt="Demo logo" />
        </Link>
      </div>
      <div className="auth-illustration">
        <img src={demoImage} alt="Demo" />
      </div>
      <div className="auth-form">
        <div className="auth-card">
          <div className="auth-form-logo">
            <Link to="/">
              <img src={logo} alt="Demo logo" />
            </Link>
          </div>
          <div className="auth-header">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
          <div className="auth-footer">{footer}</div>
        </div>
      </div>
    </div>
  );
};

AuthLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node
};

AuthLayout.defaultProps = {
  footer: null
};

export default AuthLayout;
