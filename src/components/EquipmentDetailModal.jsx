import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import './UserDetailModal.css'; // Reuse UserDetailModal styles

const EquipmentDetailModal = ({ equipment, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: equipment.name,
    category: equipment.category,
    daily_price: equipment.daily_price,
    photo_url: equipment.photo_url || '',
    pickup_location: equipment.pickup_location || '',
    status: equipment.status,
  });
  const [stats, setStats] = useState({
    totalRentals: 0,
    activeRentals: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquipmentStats();
  }, [equipment.equipment_id]);

  const fetchEquipmentStats = async () => {
    try {
      setLoading(true);
      // Get all reservations for this equipment
      const resRes = await apiRequest(`/reservation/`);
      const resData = resRes.ok ? await resRes.json() : [];

      const equipmentRentals = resData.filter(r => r.equipment_id === equipment.equipment_id);
      const activeRentals = equipmentRentals.filter(r => r.status === 'active' || r.status === 'pending').length;
      const totalRevenue = equipmentRentals.reduce((sum, r) => sum + parseFloat(r.total_price), 0);

      setStats({
        totalRentals: equipmentRentals.length,
        activeRentals,
        totalRevenue,
        averageRating: equipment.rating_avg || 0,
        totalReviews: equipment.rating_count || 0,
      });
    } catch (err) {
      console.error('Error fetching equipment stats:', err);
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

  const imageUrl = formData.photo_url || 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Equipment Details</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Equipment Header (Matches User Header style) */}
          <div className="user-header">
            <img
              src={imageUrl}
              alt={equipment.name}
              className="user-avatar-large"
              style={{ borderRadius: '8px', objectFit: 'cover' }}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
            />
            <div className="user-info">
              <h3>{equipment.name}</h3>
              <p className="user-role">{equipment.category}</p>
              <p className="user-joined">Owner: {equipment.owner_username}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-number">{stats.totalRentals}</span>
              <span className="stat-label">Total Rentals</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{stats.activeRentals}</span>
              <span className="stat-label">Active Rentals</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">৳{stats.totalRevenue.toFixed(0)}</span>
              <span className="stat-label">Total Revenue</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{stats.averageRating.toFixed(1)}</span>
              <span className="stat-label">Average Rating</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{stats.totalReviews}</span>
              <span className="stat-label">Reviews</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{equipment.owner_username}</span>
              <span className="stat-label">Owner</span>
            </div>
          </div>

          {/* Equipment Details Form */}
          <div className="details-section">
            <h4>Equipment Information</h4>
            {isEditing ? (
              <form className="edit-form">
                <div className="form-group">
                  <label>Equipment Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="form-input">
                      <option value="Photography">Photography</option>
                      <option value="Outdoor">Outdoor</option>
                      <option value="Music">Music</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Lighting">Lighting</option>
                      <option value="Video">Video</option>
                      <option value="Audio">Audio</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Daily Price (TK)</label>
                    <input
                      type="number"
                      name="daily_price"
                      value={formData.daily_price}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Photo URL</label>
                  <input
                    type="text"
                    name="photo_url"
                    value={formData.photo_url}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                <div className="form-group">
                  <label>Pickup Location</label>
                  <input
                    type="text"
                    name="pickup_location"
                    value={formData.pickup_location}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="form-input">
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </form>
            ) : (
              <div className="info-display">
                <div className="info-row">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{formData.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Category:</span>
                  <span className="info-value">{formData.category}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Daily Price:</span>
                  <span className="info-value">৳{formData.daily_price}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Pickup Location:</span>
                  <span className="info-value">{formData.pickup_location || 'Not specified'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Status:</span>
                  <span className="info-value">
                    <span className={`status-badge-small ${formData.status}`}>{formData.status}</span>
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Owner:</span>
                  <span className="info-value">{equipment.owner_username}</span>
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
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Equipment</button>
              <button className="btn btn-outline" onClick={onClose}>Close</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetailModal;
