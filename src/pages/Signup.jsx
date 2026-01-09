import React, { useState } from 'react';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './Signup.css';

const Signup = ({ onNavigate, onSignup }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Create user object with signup data
      const user = {
        name: fullName,
        email: email,
        location: 'Feni, Bangladesh',
        memberSince: 'January 2024',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        rating: 0,
        reviews: 0,
        totalRents: 0,
      };
      onSignup(user);
    }, 1200);
  };

  return (
    <AuthLayout
      title="Join GearShare"
      subtitle="Start renting and sharing gear in your local community."
      image="https://media.greatbigphotographyworld.com/wp-content/uploads/2022/04/best-cameras-for-wedding-photography.jpg"

      onHomeClick={() => onNavigate('/')}
      quote="Renting gear saved my project. I didn't have to buy a 500,000TK lens for a one-day shoot."
      author="Amin Vai"
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <Input label="Full Name" placeholder="Nazmul Haque Fahad" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input label="Email" type="email" placeholder="fahad@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
        
        <div className="info-box">
          <div className="info-icon-wrapper">
            <svg className="info-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04c0 4.833 1.157 8.214 3.393 11.094a11.967 11.967 0 007.452 4.144l.115.016.115-.016a11.967 11.967 0 007.452-4.144c2.236-2.88 3.393-6.261 3.393-11.094z" />
            </svg>
          </div>
          <p className="info-text">
          You'll need to verify your ID (Passport, Driver's License or NID Card) to start renting.
          </p>
        </div>

        <Button type="submit" variant="primary" size="lg" className="signup-button" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <p className="login-prompt">
        Already have an account?{' '}
        <button onClick={() => onNavigate('/login')} className="login-link">
          Sign in
        </button>
      </p>
    </AuthLayout>
  );
};

export default Signup;