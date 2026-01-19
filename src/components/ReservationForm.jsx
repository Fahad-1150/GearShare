import React, { useState, useEffect } from 'react';
import './ReservationForm.css';
import { apiRequest } from '../utils/api';

const ReservationForm = ({ equipment, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
  });
  
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get current username from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  let currentUsername = user.name || user.UserName_PK || user.username;
  
  console.log('ReservationForm - User data:', user);
  console.log('ReservationForm - Current username:', currentUsername);
  
  // Fallback: if no username found, try to get it directly
  if (!currentUsername) {
    console.warn('⚠️ No username found in user object. Trying alternate methods...');
    currentUsername = localStorage.getItem('username');
  }
  
  if (!currentUsername) {
    console.error('❌ CRITICAL: No username available in localStorage');
  }

  // Calculate total price when dates change
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      if (days <= 0) {
        setCalculatedPrice(0);
        setError('End date must be after start date');
        return;
      }
      
      const total = parseFloat(equipment.daily_price || equipment.price) * days;
      setCalculatedPrice(total);
      setError('');
    }
  }, [formData.start_date, formData.end_date, equipment]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.start_date || !formData.end_date) {
      setError('Please select both start and end dates');
      return;
    }

    if (!currentUsername) {
      const errorMsg = 'You must be logged in to make a reservation. Current user data: ' + JSON.stringify({user, currentUsername});
      console.error(errorMsg);
      setError('You must be logged in to make a reservation. Please log in first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('=== RESERVATION SUBMISSION ===');
      console.log('Current username:', currentUsername);
      console.log('Equipment ID:', equipment.equipment_id || equipment.id);
      console.log('Dates:', formData.start_date, 'to', formData.end_date);
      
      const requestBody = {
        equipment_id: equipment.equipment_id || equipment.id,
        start_date: formData.start_date,
        end_date: formData.end_date,
      };

      const requestOptions = {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'reserver_username': currentUsername
        }
      };

      console.log('Request options:', requestOptions);

      const response = await apiRequest(`/reservation/`, requestOptions);

      console.log('Reservation response status:', response.status);
      const responseData = await response.json();
      console.log('Reservation response data:', responseData);

      if (!response.ok) {
        setError(responseData.detail || 'Failed to create reservation');
      } else {
        // Success
        alert(`Reservation request sent successfully!\nTotal: ${calculatedPrice} TK`);
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error('Reservation submission error:', err);
      setError(err.message || 'Failed to create reservation. Please try again.');
      console.error('Reservation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="reservation-modal-overlay" onClick={onClose}>
      <div className="reservation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Reserve {equipment.name}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="equipment-summary">
            <div className="summary-item">
              <span className="label">Equipment:</span>
              <span className="value">{equipment.name}</span>
            </div>
            <div className="summary-item">
              <span className="label">Daily Price:</span>
              <span className="value">{equipment.daily_price || equipment.price} TK</span>
            </div>
            <div className="summary-item">
              <span className="label">Owner:</span>
              <span className="value">{equipment.owner_username || equipment.owner}</span>
            </div>
            <div className="summary-item">
              <span className="label">Location:</span>
              <span className="value">{equipment.pickup_location || equipment.location}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="reservation-form">
            <div className="form-group">
              <label htmlFor="start_date">Start Date *</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                min={today}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="end_date">End Date *</label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                min={formData.start_date || today}
                required
                className="form-input"
              />
            </div>

            {calculatedPrice > 0 && (
              <div className="price-calculation">
                <div className="calc-row">
                  <span>Days:</span>
                  <span>
                    {formData.start_date && formData.end_date
                      ? Math.ceil((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24))
                      : 0}
                  </span>
                </div>
                <div className="calc-row">
                  <span>Daily Rate:</span>
                  <span>{equipment.daily_price || equipment.price} TK</span>
                </div>
                <div className="calc-row total">
                  <span>Total Price:</span>
                  <span className="total-amount">{calculatedPrice} TK</span>
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading || calculatedPrice === 0}
              >
                {loading ? 'Processing...' : 'Confirm Reservation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReservationForm;
