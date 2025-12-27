import React, { useState } from 'react';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './ForgotPassword.css';

const ForgotPassword = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      //random number
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      setSentCode(randomCode);
      alert(`Your verification code is: ${randomCode}`);
      setStep(2);
      setIsLoading(false);
    }, 1000);
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (code === sentCode) {
        setStep(3);
        setError('');
      } else {
        setError('Invalid verification code. Please try again.');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match.');
        setIsLoading(false);
        return;
      }

      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters long.');
        setIsLoading(false);
        return;
      }

      alert('Password updated successfully!');
      onNavigate('/login');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <AuthLayout
      title={step === 1 ? 'Forgot Password' : step === 2 ? 'Verify Email' : 'Reset Password'}
      subtitle={step === 1 ? "No worries, we'll send you reset instructions." : step === 2 ? 'Enter the verification code we sent to your email.' : 'Enter your new password below.'}
      image="https://thumbs.dreamstime.com/z/concept-cybersecurity-data-privacy-secure-login-interface-requires-user-authentication-private-password-to-protect-419016690.jpg?ct=jpeg"
      onHomeClick={() => onNavigate('/')}
      quote="Security is not a product, but a process."
      author="Bruce Schneier"
    >
      {step === 1 && (
        <form onSubmit={handleSendCode} className="auth-form-stack">
          <p className="forgot-description">
            Enter your email address and we'll send you a verification code to reset your password.
          </p>
          
          <Input
            label="Email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && <div className="error-message">{error}</div>}

          <Button type="submit" variant="dark" size="lg" className="submit-button" isLoading={isLoading}>
            Send Verification Code
          </Button>

          <button type="button" onClick={() => onNavigate('/login')} className="back-link">
            Back to Login
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyCode} className="auth-form-stack">
          <p className="forgot-description">
            We've sent a 6-digit verification code to <strong>{email}</strong>
          </p>
          
          <Input
            label="Verification Code"
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            required
          />

          {error && <div className="error-message">{error}</div>}

          <Button type="submit" variant="dark" size="lg" className="submit-button" isLoading={isLoading}>
            Verify Code
          </Button>

          <button type="button" onClick={() => setStep(1)} className="back-link">
            Change Email
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleUpdatePassword} className="auth-form-stack">
          <p className="forgot-description">
            Create a new password for your account.
          </p>
          
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <div className="error-message">{error}</div>}

          <Button type="submit" variant="dark" size="lg" className="submit-button" isLoading={isLoading}>
            Update Password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
