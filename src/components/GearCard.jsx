import React from 'react';
import './GearCard.css';

const GearCard = ({ item }) => {
  return (
    <div className="card-item">
      <div className="card-media">
      
        <img 
          src={item.image} 
          alt={item.name} 
          className="card-image"
        />
        <div className="card-badge-rating">
          <svg className="rating-icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="rating-value">{item.rating}</span>
        </div>
        <div className="card-badge-category">
          <span className="category-tag">
            {item.category}
          </span>
        </div>
      </div>
      
      <div className="card-body">
        <div className="card-header">
          <h3 className="card-title">{item.name}</h3>
        </div>
        
        <div className="card-location">
          <svg className="location-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {item.location}
        </div>

        <div className="card-footer">
          <div className="card-pricing">
           
            <span className="price-amount">{item.price} TK</span>
            <span className="price-unit">/ day</span>
          </div>
          <button className="card-action">
            Book Now
            <svg className="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GearCard;