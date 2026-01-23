import React, { useState, useEffect } from 'react';
import './ReviewsAdmin.css';
import Footer from '../components/Footer';
import { apiRequest } from '../utils/api';

const ReviewsAdmin = ({ userData, onNavigate }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/review/');
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (review) => {
    setEditingId(review.review_id);
    setEditData({
      reservation_id: review.reservation_id,
      equipment_id: review.equipment_id,
      reviewer_username: review.reviewer_username,
      owner_username: review.owner_username,
      rating: review.rating,
      comment: review.comment
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await apiRequest(`/review/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(editData)
      });
      
      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(err.detail || 'Failed to update review');
      }
      
      setReviews(reviews.map(r =>
        r.review_id === editingId ? { ...r, ...editData } : r
      ));
      setShowEditModal(false);
      setEditingId(null);
      alert('✅ Review updated successfully!');
    } catch (err) {
      console.error('Error updating review:', err);
      alert('Failed to update review: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const response = await apiRequest(`/review/${reviewId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete review');
      }
      
      setReviews(reviews.filter(r => r.review_id !== reviewId));
      alert('✅ Review deleted successfully!');
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review: ' + (err.message || 'Unknown error'));
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.reviewer_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.owner_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(review.review_id).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);
    
    return matchesSearch && matchesRating;
  });

  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;
  const fiveStarCount = reviews.filter(r => r.rating === 5).length;
  const fourStarCount = reviews.filter(r => r.rating === 4).length;
  const threeStarCount = reviews.filter(r => r.rating === 3).length;
  const twoStarCount = reviews.filter(r => r.rating === 2).length;
  const oneStarCount = reviews.filter(r => r.rating === 1).length;

  const getRatingStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="full-page">
      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Review #{editingId}</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Reservation ID:</label>
                <input 
                  type="number" 
                  value={editData.reservation_id} 
                  onChange={(e) => setEditData({...editData, reservation_id: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Equipment ID:</label>
                <input 
                  type="number" 
                  value={editData.equipment_id} 
                  onChange={(e) => setEditData({...editData, equipment_id: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Reviewer Username:</label>
                <input 
                  type="text" 
                  value={editData.reviewer_username} 
                  onChange={(e) => setEditData({...editData, reviewer_username: e.target.value})}
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
                <label>Rating (1-5):</label>
                <select 
                  value={editData.rating} 
                  onChange={(e) => setEditData({...editData, rating: parseInt(e.target.value)})}
                >
                  <option value="1">1 Star ⭐</option>
                  <option value="2">2 Stars ⭐⭐</option>
                  <option value="3">3 Stars ⭐⭐⭐</option>
                  <option value="4">4 Stars ⭐⭐⭐⭐</option>
                  <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
                </select>
              </div>
              <div className="form-group">
                <label>Comment:</label>
                <textarea 
                  value={editData.comment || ''} 
                  onChange={(e) => setEditData({...editData, comment: e.target.value})}
                  rows="5"
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontFamily: 'inherit' }}
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

      <div className="reviews-admin-page">
        <div className="page-header">
          <h2>⭐ Reviews Management</h2>
          <p>Manage all equipment and rental reviews</p>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-icon">⭐</span>
            <div className="stat-info">
              <span className="stat-number">{averageRating}</span>
              <span className="stat-text">Average Rating</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📝</span>
            <div className="stat-info">
              <span className="stat-number">{reviews.length}</span>
              <span className="stat-text">Total Reviews</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">👍</span>
            <div className="stat-info">
              <span className="stat-number">{fiveStarCount}</span>
              <span className="stat-text">5 Star Reviews</span>
            </div>
          </div>
        </div>

        <div className="rating-breakdown">
          <h3>Rating Distribution</h3>
          <div className="rating-bars">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="rating-bar-item">
                <span className="rating-label">{rating} ⭐</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="rating-count">{reviews.filter(r => r.rating === rating).length}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="filters-section">
          <div className="search-row">
            <input
              type="text"
              placeholder="Search by reviewer, owner, comment, or ID..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-row">
            <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="filter-select">
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="reviews-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Reviewer</th>
                <th>Owner</th>
                <th>Equipment</th>
                <th>Reservation</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>⏳ Loading reviews...</td></tr>
              ) : error ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: 'red' }}>❌ {error}</td></tr>
              ) : filteredReviews.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>📭 No reviews found</td></tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review.review_id}>
                    <td><span className="id-badge">{review.review_id}</span></td>
                    <td><strong>{review.reviewer_username}</strong></td>
                    <td>{review.owner_username}</td>
                    <td>{review.equipment_id}</td>
                    <td>{review.reservation_id}</td>
                    <td>
                      <span className="rating-display" title={`${review.rating} out of 5 stars`}>
                        {getRatingStars(review.rating)}
                      </span>
                    </td>
                    <td className="comment-cell" title={review.comment || 'No comment'}>
                      {review.comment ? (review.comment.length > 50 ? review.comment.substring(0, 50) + '...' : review.comment) : '-'}
                    </td>
                    <td>{new Date(review.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn edit-btn" onClick={() => handleEditClick(review)}>✏️ Edit</button>
                        <button className="action-btn delete-btn" onClick={() => handleDeleteReview(review.review_id)}>🗑️ Delete</button>
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

export default ReviewsAdmin;
