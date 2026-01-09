import React from 'react';
import Navbar from '../components/Navbar';

const MainLayout = ({ children, onNavigate, isLoggedIn, userName, userData, onLogout }) => {
  return (
    <div className="layout-container">
      <Navbar onNavigate={onNavigate} isLoggedIn={isLoggedIn} userName={userName} userData={userData} onLogout={onLogout} />
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
};

export default MainLayout; 