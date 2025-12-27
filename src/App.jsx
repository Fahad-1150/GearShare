import React, { useState, useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import './App.css';

const App = () => {
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');

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

  const renderContent = () => {
    const path = currentPath.replace('#', '') || '/';

    switch (path) {
      case '/':
        return (
          <MainLayout onNavigate={navigateTo}>
            <Home />
          </MainLayout>
        );
      case '/login':
        return <Login onNavigate={navigateTo} />;
      case '/signup':
        return <Signup onNavigate={navigateTo} />;
      case '/forgot-password':
        return <ForgotPassword onNavigate={navigateTo} />;
      default:
        return (
          <MainLayout onNavigate={navigateTo}>
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