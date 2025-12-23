import React from 'react';
import Navbar from '../components/Navbar';

const MainLayout = ({ children, onNavigate }) => {
  return (
    <div className="layout-container">
      <Navbar onNavigate={onNavigate} />
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;