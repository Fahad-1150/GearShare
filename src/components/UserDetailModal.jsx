import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import './UserDetailModal.css';

const UserDetailModal = ({ user, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    Email: user.Email,
    Location: user.Location || '',
    Role: user.Role,
  });
  const [stats, setStats] = useState({
    equipmentCount: 0,
    activeRentals: 0,
    completedRentals: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, [user.UserName_PK]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      // Get user's equipment
      const equipRes = await apiRequest(`/equipment/owner/${user.UserName_PK}`);
      const equipData = equipRes.ok ? await equipRes.json() : [];

      // Get all reservations
      const resRes = await apiRequest(`/reservation/owner/${user.UserName_PK}`);
      const resData = resRes.ok ? await resRes.json() : [];

      const activeRentals = resData.filter(r => r.status === 'active' || r.status === 'pending').length;
      const completedRentals = resData.filter(r => r.status === 'completed').length;

      // Calculate average rating from equipment
      const totalRating = equipData.reduce((sum, eq) => sum + eq.rating_avg, 0);
      const avgRating = equipData.length > 0 ? (totalRating / equipData.length).toFixed(1) : 0;
      const totalReviews = equipData.reduce((sum, eq) => sum + eq.rating_count, 0);

      setStats({
        equipmentCount: equipData.length,
        activeRentals,
        completedRentals,
        averageRating: avgRating,
        totalReviews,
      });
    } catch (err) {
      console.error('Error fetching user stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>User Details</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* User Info */}
          <div className="user-header">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.UserName_PK}`}
              alt={user.UserName_PK}
              className="user-avatar-large"
            />
            <div className="user-info">
              <h3>{user.UserName_PK}</h3>
              <p className="user-role">{user.Role}</p>
              <p className="user-joined">Joined {new Date(user.CreatedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-number">{stats.equipmentCount}</span>
              <span className="stat-label">Equipment Listed</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{stats.activeRentals}</span>
              <span className="stat-label">Active Rentals</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{stats.completedRentals}</span>
              <span className="stat-label">Completed Rentals</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{stats.averageRating}</span>
              <span className="stat-label">Average Rating</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{stats.totalReviews}</span>
              <span className="stat-label">Total Reviews</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{user.VerificationStatus ? '✓' : '✗'}</span>
              <span className="stat-label">Verification Status</span>
            </div>
          </div>

          {/* User Details Form */}
          <div className="details-section">
            <h4>User Information</h4>
            {isEditing ? (
              <form className="edit-form">
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" value={user.UserName_PK} disabled className="form-input" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="Location"
                    value={formData.Location}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select name="Role" value={formData.Role} onChange={handleChange} className="form-input">
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </form>
            ) : (
              <div className="info-display">
                <div className="info-row">
                  <span className="info-label">Username:</span>
                  <span className="info-value">{user.UserName_PK}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{formData.Email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Location:</span>
                  <span className="info-value">{formData.Location || 'Not specified'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Role:</span>
                  <span className="info-value">{formData.Role}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Verified:</span>
                  <span className="info-value">{user.VerificationStatus ? 'Yes ✓' : 'No ✗'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          {isEditing ? (
            <>
              <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
              <button className="btn btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit User</button>
              <button className="btn btn-outline" onClick={onClose}>Close</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
