import React, { useState } from 'react';
import './ReviewForm.css';
import { apiRequest } from '../utils/api';

const ReviewForm = ({ reservation, equipment, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating < 1 || rating > 5) {
      alert('Rating must be between 1 and 5');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('/api/review/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservation_id: reservation.reservation_id,
          equipment_id: equipment.equipment_id,
          rating: parseInt(rating),
          comment: comment
        })
      });

      if (!response.ok) {
        const error = await response.json();
        alert('Failed to submit review: ' + (error.detail || 'Unknown error'));
      } else {
        alert('Review submitted successfully!');
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>Review Equipment</h2>
        <p className="review-equipment-name">{equipment.name}</p>
        <p className="review-owner">Lender: {reservation.owner_username}</p>

        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label>Your Rating</label>
            <div className="rating-selector">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${rating >= star ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  title={`${star} star${star !== 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
            <span className="rating-value">{rating} / 5 stars</span>
          </div>

          <div className="form-group">
            <label>Your Comment (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this equipment..."
              className="form-textarea"
              rows="5"
            />
          </div>

          <div className="modal-buttons">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Submitting...' : '✓ Submit Review'}
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
