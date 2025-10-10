import PropTypes from 'prop-types';
import BrandLogo from './BrandLogo.jsx';
import loginImage from '../assets/login-image.svg';

const AuthLayout = ({
  title,
  subtitle,
  children,
  footer,
  illustrationSrc = loginImage
}) => {
  return (
    <div className="auth-container">
      <div className="auth-brand-logo">
        <BrandLogo to="/pricing" ariaLabel="Dashvio home" />
      </div>
      <div className="auth-illustration">
        <img src={illustrationSrc} alt="Authentication illustration" />
      </div>
      <div className="auth-form">
        <div className="auth-card">
          <div className="auth-form-logo">
            <BrandLogo to="/pricing" ariaLabel="Dashvio home" />
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
  footer: PropTypes.node,
  illustrationSrc: PropTypes.string
};

AuthLayout.defaultProps = {
  footer: null
};

export default AuthLayout;
