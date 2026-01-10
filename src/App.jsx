import React, { useState, useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import UserDash from './pages/UserDash';
import AdminDash from './pages/AdminDash';
import TotalUser from './pages/TotalUser';
import TotalListings from './pages/TotalListings';
import ActiveRentals from './pages/ActiveRentals';
import UserReports from './pages/UserReports';
import GearDetails from './pages/GearDetails';
import './App.css';

const App = () => {
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (path) => {
    const hashPath = path.startsWith('#') ? path : `#${path}`;
    window.location.hash = hashPath;
    window.scrollTo(0, 0);
  };

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setUserData(user);
    if (user?.role === 'Admin') {
      navigateTo('/admin');
    } else {
      navigateTo('/dashboard');
    }
  };

  const handleLogout = () => {
    // clear stored token
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserData(null);
    navigateTo('/');
  };

  const renderContent = () => {
    const path = currentPath.replace('#', '') || '/';

    // Gear details route (handle before switch so we can use dynamic id paths)
    if (path.startsWith('/gear/')) {
      const id = parseInt(path.split('/')[2], 10);
      try {
        const { listings } = require('./data/listings');
        const item = listings.find(l => l.id === id);
        if (!item) {
          navigateTo('/');
          return null;
        }
        return (
          <MainLayout onNavigate={navigateTo} isLoggedIn={isLoggedIn} userName={userData?.name} userData={userData} onLogout={handleLogout}>
            <GearDetails item={item} onBack={() => navigateTo(userData?.role === 'Admin' ? '/admin/listings' : '/dashboard')} />
          </MainLayout>
        );
      } catch (err) {
        console.error('Could not load listings data', err);
        navigateTo('/');
        return null;
      }
    }

    switch (path) {
      case '/':
        return (
          <MainLayout onNavigate={navigateTo} isLoggedIn={isLoggedIn} userName={userData?.name} userData={userData} onLogout={handleLogout}>
            <Home />
          </MainLayout>
        );
      case '/login':
        return <Login onNavigate={navigateTo} onLogin={handleLogin} />;
      case '/signup':
        return <Signup onNavigate={navigateTo} onSignup={handleLogin} />;
      case '/forgot-password':
        return <ForgotPassword onNavigate={navigateTo} />;
      case '/admin':
        if (!isLoggedIn) {
          navigateTo('/login');
          return null;
        }
        if (userData?.role !== 'Admin') {
          navigateTo('/dashboard');
          return null;
        }
        return (
          <MainLayout onNavigate={navigateTo} isLoggedIn={isLoggedIn} userName={userData?.name} userData={userData} onLogout={handleLogout}>
            <AdminDash userData={userData} onNavigate={navigateTo} />
          </MainLayout>
        );

      case '/admin/users':
        if (!isLoggedIn) {
          navigateTo('/login');
          return null;
        }
        if (userData?.role !== 'Admin') {
          navigateTo('/dashboard');
          return null;
        }
        return (
          <MainLayout onNavigate={navigateTo} isLoggedIn={isLoggedIn} userName={userData?.name} userData={userData} onLogout={handleLogout}>
            <TotalUser userData={userData} onNavigate={navigateTo} />
          </MainLayout>
        );

      case '/admin/listings':
        if (!isLoggedIn) {
          navigateTo('/login');
          return null;
        }
        if (userData?.role !== 'Admin') {
          navigateTo('/dashboard');
          return null;
        }
        return (
          <MainLayout onNavigate={navigateTo} isLoggedIn={isLoggedIn} userName={userData?.name} userData={userData} onLogout={handleLogout}>
            <TotalListings onNavigate={navigateTo} />
          </MainLayout>
        );

      case '/admin/rentals':
        if (!isLoggedIn) {
          navigateTo('/login');
          return null;
        }
        if (userData?.role !== 'Admin') {
          navigateTo('/dashboard');
          return null;
        }
        return (
          <MainLayout onNavigate={navigateTo} isLoggedIn={isLoggedIn} userName={userData?.name} userData={userData} onLogout={handleLogout}>
            <ActiveRentals userData={userData} onNavigate={navigateTo} />
          </MainLayout>
        );

      case '/admin/reports':
        if (!isLoggedIn) {
          navigateTo('/login');
          return null;
        }
        if (userData?.role !== 'Admin') {
          navigateTo('/dashboard');
          return null;
        }
        return (
          <MainLayout onNavigate={navigateTo} isLoggedIn={isLoggedIn} userName={userData?.name} userData={userData} onLogout={handleLogout}>
            <UserReports userData={userData} onNavigate={navigateTo} />
          </MainLayout>
        );

      case '/dashboard':
        if (!isLoggedIn) {
          navigateTo('/login');
          return null;
        }
        return (
          <MainLayout onNavigate={navigateTo} isLoggedIn={isLoggedIn} userName={userData?.name} userData={userData} onLogout={handleLogout}>
            <UserDash userData={userData} setUserData={setUserData} onNavigate={navigateTo} />
          </MainLayout>
        );
      default:
        return (
          <MainLayout onNavigate={navigateTo} isLoggedIn={isLoggedIn} userName={userData?.name} userData={userData} onLogout={handleLogout}>
            <Home />
          </MainLayout>
        );
    }
  };

  return (
    <div className="antialiased">
      {renderContent()}
    </div>
  );
};

export default App;