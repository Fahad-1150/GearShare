import React from 'react';
import './AdminDash.css';
import Footer from '../components/Footer';

const AdminDash = ({ userData, onNavigate }) => {
  const stats = [
    { label: 'Total Users', value: 1024 },
    { label: 'Total Listings', value: 254 },
    { label: 'Active Rentals', value: 87 },
    { label: 'Reports', value: 7 }
  ];

  const handleStatClick = (label) => {
    if (label === 'Total Users') onNavigate('/admin/users');
    if (label === 'Total Listings') onNavigate('/admin/listings');
  };

  return (
   <div className="full-page">
   <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p style={{ marginTop: 4 }}>Welcome, {userData?.name || 'Admin'}</p>
      </div>

      <div className="admin-stats">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`admin-stat ${['Total Users','Total Listings'].includes(s.label) ? 'clickable' : ''}`}
            onClick={() => ['Total Users','Total Listings'].includes(s.label) && handleStatClick(s.label)}
            role={['Total Users','Total Listings'].includes(s.label) ? 'button' : undefined}
            tabIndex={['Total Users','Total Listings'].includes(s.label) ? 0 : undefined}
            onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && ['Total Users','Total Listings'].includes(s.label)) handleStatClick(s.label); }}
          >
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="admin-actions">
        <button className="btn" onClick={() => onNavigate('/dashboard')}>Open User View</button>
      </div>
    </div>

  <Footer/>
   </div>

    
  );
};

export default AdminDash;
