import React, { useState, useEffect } from 'react';
import './GearDetails.css';
import ReservationForm from '../components/ReservationForm';
import { apiRequest } from '../utils/api';

const GearDetails = ({ item, onBack }) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [equipmentData, setEquipmentData] = useState(item);
  const [reviews, setReviews] = useState([]);

  // Fetch reviews on component mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await apiRequest(`/api/review/equipment/${item.id || item.equipment_id}`);
        if (response.ok) {
          const reviewsData = await response.json();
          setReviews(reviewsData);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
    };

    if (item.id || item.equipment_id) {
      fetchReviews();
    }
  }, [item.id, item.equipment_id]);

  // Check if equipment has active reservation
  const hasActiveReservation = () => {
    // Check if equipment status is booked
    if (item.status === 'booked') {
      return true;
    }
    return false;
  };

  // Check if equipment is available for booking
  const isAvailable = () => {
    // Simply check if status is available
    return item.status === 'available' || item.isAvailable === true;
  };

  const handleMarkAsReturned = async () => {
    if (!window.confirm('Mark this equipment as returned and make it available for booking?')) return;
    
    try {
      setLoading(true);
      await apiRequest(`/equipment/${item.id}`, 'PUT', {
        status: 'available',
        booked_till: null
      });
      alert('Equipment marked as returned successfully!');
      setEquipmentData({
        ...equipmentData,
        status: 'available',
        booked_till: null,
        reservation_status: null
      });
    } catch (error) {
      alert('Failed to mark equipment as returned: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  const allReviews = item.reviewsData || [];
  
  
  const displayedReviews = showAllReviews ? allReviews : allReviews.slice(0, 3);

  return (
    <div className="home-wrapper">
     
      <nav className="details-nav">
        <button onClick={onBack} className="back-link">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to listings
        </button>
      </nav>

      <main className="product-container">
        <div className="lender-container">
          <div className="lender-grid">
          
            <div className="image-side">
              <div className="image-wrapper">
                <img src={item.image} className="main-gear-img" alt={item.name} />
                <div className="stat-card">
                  <p className="stat-amount">{item.rating} ★</p>
                  <p className="stat-label">{item.reviews} Verified Reviews</p>
                </div>
              </div>

             
              <div className="specs-grid">
                <div className="spec-item">
                  <span className="spec-label">Condition</span>
                  <span className="spec-value">Excellent</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Category</span>
                  <span className="spec-value">{item.category}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Lender</span>
                  <span className="spec-value">{item.owner}</span>
                </div>
              </div>
            </div>

           
            <div className="text-side">
              <div className="sticky-details">
                <span className="section-label">Verified Equipment</span>
                <h2 className="section-heading">{item.name}</h2>
                <p className="section-text">
                  Professional grade equipment located in <strong>{item.location}</strong>. 
                  Includes standard maintenance and cleanliness guarantee.
                </p>

                <div className="price-card">
                  <div className="price-row">
                    <div className="price-info">
                      <span className="price-value">{item.price} TK</span>
                      <span className="price-label"> / per day</span>
                    </div>
                  </div>

                  {hasActiveReservation() ? (
                    <>
                      <div className="booked-info">
                        <span className="booked-date">⏰ Booked Till: {item.booked_till ? new Date(item.booked_till).toLocaleDateString() : 'Date pending'}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <button 
                        className={`btn-primary booking ${!isAvailable() ? 'disabled' : ''}`}
                        onClick={() => setShowReservationForm(true)}
                        disabled={!isAvailable()}
                      >
                        {isAvailable() ? "Reserve Now" : "Not Available"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Map Section */}
      <section className="map-section-area">
        <div className="lender-container">
          <h2 className="grid-title">Pickup Location</h2>
          <div className="map-container-wrapper">
            <iframe title="map" className="map-iframe" src={`https://maps.google.com/maps?q=${encodeURIComponent(item.location)}&output=embed`}></iframe>
          </div>
        </div>
      </section>

      <section className="reviews-section">
        <div className="lender-container">
          <div className="reviews-header">
            <h2 className="grid-title">Customer Reviews</h2>
            <div className="rating-summary">
              <span className="big-rating">{equipmentData.rating_avg || item.rating || 0}</span>
              <span className="total-count">({reviews.length} reviews)</span>
            </div>
          </div>

          <div className="reviews-grid">
            {reviews.length > 0 ? (
              (showAllReviews ? reviews : reviews.slice(0, 3)).map((rev) => (
                <div key={rev.review_id} className="review-card">
                  <div className="rev-user-row">
                    <div className="rev-avatar">{rev.reviewer_username ? rev.reviewer_username.charAt(0) : 'U'}</div>
                    <div className="rev-info">
                      <p className="rev-name">{rev.reviewer_username}</p>
                      <p className="rev-date">{new Date(rev.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="rev-stars">{"★".repeat(rev.rating)}</div>
                  </div>
                  <p className="rev-comment">{rev.comment || 'No comment provided'}</p>
                </div>
              ))
            ) : (
              <p className="no-reviews">No reviews for this equipment yet.</p>
            )}
          </div>

          {reviews.length > 3 && (
            <button 
              className="show-all-btn" 
              onClick={() => setShowAllReviews(!showAllReviews)}
            >
              {showAllReviews ? "Show Less" : `Show All ${reviews.length} Reviews`}
            </button>
          )}
        </div>
      </section>

      {showReservationForm && (
        <ReservationForm 
          equipment={item} 
          onClose={() => setShowReservationForm(false)}
          onSuccess={() => {
            // Refresh or update equipment status if needed
          }}
        />
      )}
    </div>
  );
};

export default GearDetails;