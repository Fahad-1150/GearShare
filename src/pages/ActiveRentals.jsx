import React, { useState } from 'react';
import './ActiveRentals.css';
import Footer from '../components/Footer';

const ActiveRentals = ({ userData, onNavigate }) => {
  const [activeRentals, setActiveRentals] = useState([
    { id: 'R002', user: 'Jane Smith', userEmail: 'jane@email.com', item: 'DJI Mavic 3', owner: 'Tech Rentals', startDate: '2026-01-03', endDate: '2026-01-07', amount: '$200', daysLeft: 2 },
    { id: 'R004', user: 'Sarah Wilson', userEmail: 'sarah@email.com', item: 'GoPro Hero 12', owner: 'Adventure Gear', startDate: '2026-01-05', endDate: '2026-01-08', amount: '$80', daysLeft: 3 },
    { id: 'R007', user: 'Alex Turner', userEmail: 'alex@email.com', item: 'Sony FX3', owner: 'Pro Cinema', startDate: '2026-01-04', endDate: '2026-01-11', amount: '$350', daysLeft: 6 },
    { id: 'R008', user: 'Lisa Chen', userEmail: 'lisa@email.com', item: 'Blackmagic 6K', owner: 'Film Supply Co', startDate: '2026-01-06', endDate: '2026-01-13', amount: '$280', daysLeft: 8 },
    { id: 'R009', user: 'David Kim', userEmail: 'david@email.com', item: 'Aputure 600d', owner: 'Light Masters', startDate: '2026-01-07', endDate: '2026-01-10', amount: '$120', daysLeft: 5 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDays, setFilterDays] = useState('all');

  const handleExtendRental = (rentalId) => {
    alert(`Extend rental ${rentalId} - A modal would open to select new end date`);
  };

  const handleEndRental = (rentalId) => {
    if (confirm(`Are you sure you want to end rental ${rentalId}?`)) {
      setActiveRentals(activeRentals.filter(r => r.id !== rentalId));
      alert(`Rental ${rentalId} has been ended successfully`);
    }
  };

  const handleContactRenter = (email, rentalId) => {
    alert(`Opening email to ${email} regarding rental ${rentalId}`);
  };

  const filteredRentals = activeRentals.filter(rental => {
    const matchesSearch = rental.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rental.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rental.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterDays === 'all') return matchesSearch;
    if (filterDays === 'urgent') return matchesSearch && rental.daysLeft <= 2;
    if (filterDays === 'soon') return matchesSearch && rental.daysLeft <= 4;
    return matchesSearch;
  });

  const totalValue = activeRentals.reduce((sum, r) => sum + parseInt(r.amount.replace('$', '')), 0);
  const endingSoon = activeRentals.filter(r => r.daysLeft <= 2).length;

  return (
    <div className="full-page">
      <div className="active-rentals-page">
        <div className="page-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => onNavigate('/admin')}>
              ← Back to Dashboard
            </button>
            <h1>Active Rentals</h1>
            <p>Manage all currently active rental transactions</p>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-icon">📦</span>
            <div className="stat-info">
              <span className="stat-number">{activeRentals.length}</span>
              <span className="stat-text">Active Rentals</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">💵</span>
            <div className="stat-info">
              <span className="stat-number">${totalValue}</span>
              <span className="stat-text">Total Value</span>
            </div>
          </div>
          <div className="stat-card warning">
            <span className="stat-icon">⚠️</span>
            <div className="stat-info">
              <span className="stat-number">{endingSoon}</span>
              <span className="stat-text">Ending Soon</span>
            </div>
          </div>
        </div>

        <div className="filters-section">
          <input
            type="text"
            placeholder="Search by user, item, or rental ID..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-select"
            value={filterDays}
            onChange={(e) => setFilterDays(e.target.value)}
          >
            <option value="all">All Rentals</option>
            <option value="urgent">Urgent (≤2 days)</option>
            <option value="soon">Ending Soon (≤4 days)</option>
          </select>
        </div>

        <div className="table-container">
          <table className="rentals-table">
            <thead>
              <tr>
                <th>Rental ID</th>
                <th>Renter</th>
                <th>Item</th>
                <th>Owner</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days Left</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRentals.map((rental) => (
                <tr key={rental.id} className={rental.daysLeft <= 2 ? 'urgent-row' : ''}>
                  <td><span className="rental-id">{rental.id}</span></td>
                  <td>
                    <div className="user-cell">
                      <span className="user-name">{rental.user}</span>
                      <span className="user-email">{rental.userEmail}</span>
                    </div>
                  </td>
                  <td><strong>{rental.item}</strong></td>
                  <td>{rental.owner}</td>
                  <td>{rental.startDate}</td>
                  <td>{rental.endDate}</td>
                  <td>
                    <span className={`days-badge ${rental.daysLeft <= 2 ? 'urgent' : rental.daysLeft <= 4 ? 'warning' : 'normal'}`}>
                      {rental.daysLeft} days
                    </span>
                  </td>
                  <td><strong>{rental.amount}</strong></td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn extend-btn" onClick={() => handleExtendRental(rental.id)}>
                        🔄 Extend
                      </button>
                      <button className="action-btn contact-btn" onClick={() => handleContactRenter(rental.userEmail, rental.id)}>
                        ✉️
                      </button>
                      <button className="action-btn end-btn" onClick={() => handleEndRental(rental.id)}>
                        ⏹️ End
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRentals.length === 0 && (
            <div className="no-results">No rentals found matching your criteria</div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ActiveRentals;
