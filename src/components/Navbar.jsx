import React from 'react';
import './NavBar.css';
import logo from '../images/logo.png';

const Navbar = ({ onNavigate }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          <div
            className="navbar-brand"
            onClick={() => onNavigate('/')}
          >
            <div className="brand-logo">
              <img src={logo} alt="GearShare" className="logo-icon" />
            </div>
            <span className="brand-name">GearShare</span>
            
          </div>

          <div className="navbar-links">
            {/* onNavigate */}
            <button onClick={() => onNavigate('/')} className="nav-link">Browse</button>
            <button className="nav-link">How it Works</button>
            <button className="nav-link">List Item</button>
          </div>

          <div className="navbar-actions">
            <button
              onClick={() => onNavigate('/login')}
              className="btn-login"
            >
              Log in
            </button>
            <button
              onClick={() => onNavigate('/signup')}
              className="btn-signup"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;