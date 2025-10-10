import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';

const BrandLogo = ({ to, className, orientation, showText, ariaLabel, onClick }) => {
  const classes = ['brand-logo'];

  if (orientation === 'vertical') {
    classes.push('brand-logo-vertical');
  } else {
    classes.push('brand-logo-horizontal');
  }

  if (className) {
    classes.push(className);
  }

  const content = (
    <>
      <span className="brand-logo-mark" aria-hidden="true">
        <img src={logo} alt="" loading="lazy" />
      </span>
      {showText && <span className="brand-logo-text">Dashvio</span>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes.join(' ')} aria-label={ariaLabel} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <div className={classes.join(' ')} aria-label={ariaLabel} onClick={onClick}>
      {content}
    </div>
  );
};

BrandLogo.propTypes = {
  to: PropTypes.string,
  className: PropTypes.string,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  showText: PropTypes.bool,
  ariaLabel: PropTypes.string,
  onClick: PropTypes.func
};

BrandLogo.defaultProps = {
  to: undefined,
  className: '',
  orientation: 'horizontal',
  showText: true,
  ariaLabel: 'Dashvio',
  onClick: undefined
};

export default BrandLogo;
