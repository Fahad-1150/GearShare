import React from 'react';
import './AuthLayout.css';

const AuthLayout = ({ 
  children, 
  title, 
  subtitle, 
  image, 
  onHomeClick,
  quote,
  author
}) => {
  return (
    <div className="auth-wrapper">
      {/* Visual Side */}
      <div className="auth-visual-panel">
        <img 
          src={image} 
          className="auth-visual-bg" 
          alt="Auth visual"
        />
        <div className="auth-visual-overlay"></div>
        <div className="auth-visual-content">
          <div className="auth-brand-group" onClick={onHomeClick}>
            <div className="auth-logo-box">
              <svg className="auth-logo-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <image src={image} ></image>
              </svg>
            </div>
            <span className="auth-brand-text">GearShare</span>
          </div>
          
          {quote && (
            <div className="auth-quote-container">
              <blockquote className="auth-blockquote">
                <p className="auth-quote-text">
                  "{quote}"
                </p>
                {author && (
                  <footer className="auth-quote-footer">
                    <p className="auth-author-name">{author}</p>
                    <p className="auth-author-label">✔️Verified</p>
                  </footer>
                )}
              </blockquote>
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2 className="auth-form-title">{title}</h2>
            <p className="auth-form-subtitle">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;