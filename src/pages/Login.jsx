import React, { useState } from 'react';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { apiRequest } from '../utils/api';
import './Login.css';
const Login = ({ onNavigate, onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        const user = {
          name: data.user.UserName_PK,
          email: data.user.Email,
          role: data.user.Role,
          location: data.user.Location,
          memberSince: new Date(data.user.CreatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.UserName_PK}`,
          rating: 4.9,
          reviews: 124,
          totalRents: 45,
        };
        onLogin(user);
        if (user.role === 'Admin') {
          onNavigate('/admin');
        } else {
          onNavigate('/dashboard');
        }
      } else {
        try {
          const error = await response.json();
          let errorMessage = 'Login failed';
          if (error.detail) {
            if (Array.isArray(error.detail)) {
              errorMessage = error.detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
            } else {
              errorMessage = error.detail;
            }
          }
          alert(errorMessage);
        } catch (e) {
          alert(`Server error: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(`Network error: ${error.message || 'Unable to connect to server. Make sure FastAPI is running on http://127.0.0.1:8000'}`);
    } finally {
      setIsLoading(false);
    }
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

      <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem', background: '#f3f4f6', padding: '0.5rem', borderRadius: '6px' }}>
        <p style={{ margin: 0 }}><strong>Admin Demo:</strong> admin@gmail.com / 12345678</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form-stack">
        <Input label="Email" type="email" placeholder="name@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
        
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