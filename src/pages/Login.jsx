import React, { useState } from 'react';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './Login.css';
const Login = ({ onNavigate }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onNavigate('/');
    }, 1200);
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Log in to access your dashboard and saved gear."
      image="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200"
      onHomeClick={() => onNavigate('/')}
      quote="The best camera is the one you can rent for 1120 TK a day."
      author="Nazmul Haque Fahad"
    >
      <div className="social-grid">
        <Button variant="outline" className="social-button">
          <img src="https://www.svgrepo.com/show/355037/google.svg" className="social-icon" alt="Google" />
          Google
        </Button>
        <Button variant="outline" className="social-button">
          <img src="https://e7.pngegg.com/pngimages/779/788/png-clipart-apple-logo-%E4%BF%83%E9%94%80-heart-logo.png" className="social-icon" alt="Apple" />
          Apple
        </Button>
      </div>

      <div className="divider-area">
        <div className="divider-line"></div>
        <span className="divider-text">Or login with email</span>
      </div>

      <form onSubmit={handleSubmit} className="auth-form-stack">
        <Input label="Email" type="email" placeholder="name@company.com" required />
        <Input label="Password" type="password" placeholder="••••••••" required />
        
        <div className="form-utilities">
          <div className="remember-group">
            <input type="checkbox" id="remember" className="checkbox-input" />
            <label htmlFor="remember" className="checkbox-label">Remember me</label>
          </div>
          <a href="#/forgot-password" className="forgot-link"> Forgot password? </a>
        </div>

        <Button type="submit" variant="dark" size="lg" className="submit-button" isLoading={isLoading}>
          Sign in
        </Button>
      </form>

      <p className="signup-prompt">
        New to GearShare?{' '}
        <button onClick={() => onNavigate('/signup')} className="signup-link">
          Create account
        </button>
      </p>
    </AuthLayout>
  );
};

export default Login;