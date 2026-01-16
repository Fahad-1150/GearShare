import React from 'react';
import './Footer.css';
import logo from '../images/logo.png';

const Footer = () => {
  return (
    <div className="full-page">
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-logo">
            <div className="logo-box">
              <img src={logo} alt="GearShare" className="logo-icon" style={{ width: '100%', padding: '5px' }} />
            </div>
            <span className="logo-text">GearShare</span>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <span className="group-title">Platform</span>
              <a href="#browse">Browse Gear</a>
              <a href="#how">How it works</a>
            </div>
            <div className="link-group">
              <span className="group-title">Support</span>
              <a href="#help">Help Center</a>
              <a href="#safety">Trust & Safety</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © 2025 GearShare Inc.
        </div>
        <div>
          <p>Developed by Nh.Fahad , Bapon Das ,Zubayed Amin</p>
        </div>
      </div>
    </footer>
    </div>
  );
};

export default Footer;