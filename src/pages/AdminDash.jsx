import React, { useState } from 'react';
import './AdminDash.css';
import Footer from '../components/Footer';

const AdminDash = ({ userData, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [reportType, setReportType] = useState('rental');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [generatingReport, setGeneratingReport] = useState(false);

  const stats = [
    { label: 'Total Users', value: 1024, path: '/admin/users' },
    { label: 'Total Listings', value: 254, path: '/admin/listings' },
    { label: 'Active Rentals', value: 87, path: '/admin/rentals' },
    { label: 'Reports', value: 7, path: '/admin/reports' },
    
  ];

  // Sample rental history data
  const rentalHistory = [
    { id: 'R001', user: 'John Doe', item: 'Canon EOS R5', startDate: '2026-01-01', endDate: '2026-01-05', status: 'Completed', amount: '$150' },
    { id: 'R002', user: 'Jane Smith', item: 'DJI Mavic 3', startDate: '2026-01-03', endDate: '2026-01-07', status: 'Active', amount: '$200' },
    { id: 'R003', user: 'Mike Johnson', item: 'Sony A7 IV', startDate: '2026-01-02', endDate: '2026-01-04', status: 'Completed', amount: '$120' },
    { id: 'R004', user: 'Sarah Wilson', item: 'GoPro Hero 12', startDate: '2026-01-05', endDate: '2026-01-08', status: 'Active', amount: '$80' },
    { id: 'R005', user: 'Tom Brown', item: 'Rode Wireless GO II', startDate: '2025-12-28', endDate: '2026-01-02', status: 'Completed', amount: '$50' },
    { id: 'R006', user: 'Emily Davis', item: 'Zhiyun Crane 3S', startDate: '2026-01-06', endDate: '2026-01-10', status: 'Pending', amount: '$90' },
  ];

  const handleStatClick = (path) => {
    onNavigate(path);
  };

  const handleGenerateReport = () => {
    setGeneratingReport(true);
    // Simulate report generation
    setTimeout(() => {
      setGeneratingReport(false);
      alert(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully!`);
    }, 1500);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'status-completed';
      case 'Active': return 'status-active';
      case 'Pending': return 'status-pending';
      default: return '';
    }
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
            className="admin-stat clickable"
            onClick={() => handleStatClick(s.path)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleStatClick(s.path); }}
          >
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      

      

      {/* Tab Content */}
      
     
    </div>

  <Footer/>
   </div>
  );
};

export default AdminDash;
