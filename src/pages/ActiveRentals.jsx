import React, { useState, useEffect } from 'react';
import './ActiveRentals.css';
import Footer from '../components/Footer';
import { apiRequest } from '../utils/api';

const ActiveRentals = ({ userData, onNavigate }) => {
  const [activeRentals, setActiveRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [daysFilter, setDaysFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchActiveRentals();
    checkExpiredRentals();
  }, []);

  const checkExpiredRentals = async () => {
    try {
      await apiRequest('/reservation/update-expired-rentals', {
        method: 'POST'
      });
    } catch (err) {
      console.warn('Could not update expired rentals:', err);
    }
  };

  const fetchActiveRentals = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/reservation/');
      if (!response.ok) throw new Error('Failed to fetch rentals');
      const data = await response.json();
      
      // Filter for active rentals and calculate days left
      const activeRentalsData = data
        .filter(r => r.status === 'active' || r.status === 'pending')
        .map(r => {
          const today = new Date();
          const endDate = new Date(r.end_date);
          const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
          return {
            ...r,
            daysLeft: Math.max(0, daysLeft)
          };
        });
      
      setActiveRentals(activeRentalsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching rentals:', err);
      setError('Failed to load active rentals');
      setActiveRentals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptReservation = async (rentalId, rental) => {
    try {
      const response = await apiRequest(`/reservation/${rentalId}`, {
        method: 'PUT',
        headers: { 'owner_username': rental.owner_username },
        body: JSON.stringify({ status: 'active' })
      });
      
      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(err.detail || 'Failed to accept reservation');
      }
      
      setActiveRentals(activeRentals.map(r =>
        r.reservation_id === rentalId ? { ...r, status: 'active' } : r
      ));
      alert(`✅ Reservation ${rentalId} accepted! Equipment marked as BOOKED until ${new Date(rental.end_date).toLocaleDateString()}`);
    } catch (err) {
      console.error('Error accepting reservation:', err);
      alert('Failed to accept reservation: ' + (err.message || 'Unknown error'));
    }
  };

  const handleRejectReservation = async (rentalId) => {
    if (!confirm('Are you sure you want to reject this reservation?')) return;
    
    try {
      const rental = activeRentals.find(r => r.reservation_id === rentalId);
      const response = await apiRequest(`/reservation/${rentalId}`, {
        method: 'PUT',
        headers: { 'owner_username': rental.owner_username },
        body: JSON.stringify({ status: 'cancelled' })
      });
      
      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(err.detail || 'Failed to reject reservation');
      }
      
      setActiveRentals(activeRentals.map(r =>
        r.reservation_id === rentalId ? { ...r, status: 'cancelled' } : r
      ));
      alert(`❌ Reservation ${rentalId} rejected! Equipment remains available.`);
    } catch (err) {
      console.error('Error rejecting reservation:', err);
      alert('Failed to reject reservation: ' + (err.message || 'Unknown error'));
    }
  };

  const handleEditClick = (rental) => {
    setEditingId(rental.reservation_id);
    setEditData({
      equipment_id: rental.equipment_id,
      reserver_username: rental.reserver_username,
      owner_username: rental.owner_username,
      status: rental.status,
      start_date: rental.start_date,
      end_date: rental.end_date,
      per_day_price: rental.per_day_price,
      total_price: rental.total_price
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await apiRequest(`/reservation/${editingId}`, {
        method: 'PUT',
        headers: { 'owner_username': editData.owner_username },
        body: JSON.stringify(editData)
      });
      
      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(err.detail || 'Failed to update rental');
      }
      
      setActiveRentals(activeRentals.map(r =>
        r.reservation_id === editingId 
          ? { ...r, ...editData, daysLeft: Math.max(0, Math.ceil((new Date(editData.end_date) - new Date()) / (1000 * 60 * 60 * 24))) }
          : r
      ));
      setShowEditModal(false);
      setEditingId(null);
      alert('✅ Rental updated successfully!');
    } catch (err) {
      console.error('Error updating rental:', err);
      alert('Failed to update rental: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDeleteRental = async (rentalId) => {
    if (!confirm('Are you sure you want to delete this rental record?')) return;
    
    try {
      const rental = activeRentals.find(r => r.reservation_id === rentalId);
      const response = await apiRequest(`/reservation/${rentalId}`, {
        method: 'DELETE',
        headers: { 'owner_username': rental.owner_username }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete rental');
      }
      
      setActiveRentals(activeRentals.filter(r => r.reservation_id !== rentalId));
      alert('✅ Rental deleted successfully!');
    } catch (err) {
      console.error('Error deleting rental:', err);
      alert('Failed to delete rental: ' + (err.message || 'Unknown error'));
    }
  };

  const filteredRentals = activeRentals.filter(rental => {
    const matchesSearch = 
      rental.reserver_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.owner_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(rental.reservation_id).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || rental.status === statusFilter;
    
    let matchesDays = true;
    if (daysFilter === 'urgent') matchesDays = rental.daysLeft <= 2;
    else if (daysFilter === 'soon') matchesDays = rental.daysLeft <= 7;
    else if (daysFilter === 'coming') matchesDays = rental.daysLeft > 7;
    
    return matchesSearch && matchesStatus && matchesDays;
  });

  const totalValue = filteredRentals.reduce((sum, r) => sum + parseFloat(r.total_price || 0), 0);
  const pendingCount = filteredRentals.filter(r => r.status === 'pending').length;

  return (
    <div className="full-page">
      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Rental #{editingId}</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Equipment ID:</label>
                <input 
                  type="number" 
                  value={editData.equipment_id} 
                  onChange={(e) => setEditData({...editData, equipment_id: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Owner Username:</label>
                <input 
                  type="text" 
                  value={editData.owner_username} 
                  onChange={(e) => setEditData({...editData, owner_username: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Reserver Username:</label>
                <input 
                  type="text" 
                  value={editData.reserver_username} 
                  onChange={(e) => setEditData({...editData, reserver_username: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Status:</label>
                <select 
                  value={editData.status} 
                  onChange={(e) => setEditData({...editData, status: e.target.value})}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Date:</label>
                <input 
                  type="date" 
                  value={editData.start_date} 
                  onChange={(e) => setEditData({...editData, start_date: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>End Date:</label>
                <input 
                  type="date" 
                  value={editData.end_date} 
                  onChange={(e) => setEditData({...editData, end_date: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Per Day Price:</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editData.per_day_price} 
                  onChange={(e) => setEditData({...editData, per_day_price: parseFloat(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Total Price:</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editData.total_price} 
                  onChange={(e) => setEditData({...editData, total_price: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSaveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <div className="active-rentals-page">
        <div className="page-header">
          <h2>🚀 Active Rentals</h2>
          <p>Manage all rental transactions and reservations</p>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-icon">📦</span>
            <div className="stat-info">
              <span className="stat-number">{filteredRentals.length}</span>
              <span className="stat-text">Total Rentals</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⏳</span>
            <div className="stat-info">
              <span className="stat-number">{pendingCount}</span>
              <span className="stat-text">Pending Approval</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">💵</span>
            <div className="stat-info">
              <span className="stat-number">{totalValue.toFixed(2)}</span>
              <span className="stat-text">Total Value</span>
            </div>
          </div>
        </div>

        <div className="filters-section">
          <div className="search-row">
            <input
              type="text"
              placeholder="Search by user, owner, or ID..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-row">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select value={daysFilter} onChange={(e) => setDaysFilter(e.target.value)} className="filter-select">
              <option value="all">All Days</option>
              <option value="urgent">Urgent (≤2 days)</option>
              <option value="soon">Soon (≤7 days)</option>
              <option value="coming">Coming (&gt;7 days)</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="rentals-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Equipment</th>
                <th>Owner</th>
                <th>Reserver</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Per Day</th>
                <th>Total</th>
                <th>Status</th>
                <th>Days Left</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>⏳ Loading rentals...</td></tr>
              ) : error ? (
                <tr><td colSpan="11" style={{ textAlign: 'center', padding: '20px', color: 'red' }}>❌ {error}</td></tr>
              ) : filteredRentals.length === 0 ? (
                <tr><td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>📭 No rentals match filters</td></tr>
              ) : (
                filteredRentals.map((rental) => (
                  <tr key={rental.reservation_id} className={rental.status === 'pending' ? 'pending-row' : ''}>
                    <td><span className="id-badge">{rental.reservation_id}</span></td>
                    <td>{rental.equipment_id}</td>
                    <td><strong>{rental.owner_username}</strong></td>
                    <td>{rental.reserver_username}</td>
                    <td>{new Date(rental.start_date).toLocaleDateString()}</td>
                    <td>{new Date(rental.end_date).toLocaleDateString()}</td>
                    <td>{rental.per_day_price}</td>
                    <td><strong>{rental.total_price?.toFixed(2)}</strong></td>
                    <td>
                      <span className={`status-badge status-${rental.status}`}>
                        {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`days-badge ${rental.daysLeft <= 2 ? 'urgent' : rental.daysLeft <= 7 ? 'warning' : 'normal'}`}>
                        {rental.daysLeft} days
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {rental.status === 'pending' && (
                          <>
                            <button className="action-btn accept-btn" onClick={() => handleAcceptReservation(rental.reservation_id, rental)}>✅ Accept</button>
                            <button className="action-btn reject-btn" onClick={() => handleRejectReservation(rental.reservation_id)}>❌ Reject</button>
                          </>
                        )}
                        <button className="action-btn edit-btn" onClick={() => handleEditClick(rental)}>✏️ Edit</button>
                        <button className="action-btn delete-btn" onClick={() => handleDeleteRental(rental.reservation_id)}>🗑️ Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ActiveRentals;
