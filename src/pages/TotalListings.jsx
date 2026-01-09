import React, { useState, useMemo } from 'react';
import './TotalListings.css';
import GearCard from '../components/GearCard';
import Footer from '../components/Footer';

import { listings as mockListings } from '../data/listings';

const TotalListings = ({ onNavigate }) => {
  const [filters, setFilters] = useState({ name: '', category: 'any', location: '', availability: 'any' });

  const filtered = useMemo(() => {
    return mockListings.filter((l) => {
      if (filters.name && !l.name.toLowerCase().includes(filters.name.trim().toLowerCase())) return false;
      if (filters.category !== 'any' && l.category !== filters.category) return false;
      if (filters.location && !l.location.toLowerCase().includes(filters.location.trim().toLowerCase())) return false;
      if (filters.availability === 'available' && !l.isAvailable) return false;
      if (filters.availability === 'booked' && l.isAvailable) return false;
      return true;
    });
  }, [filters]);

  const onChange = (k) => (e) => setFilters((p) => ({ ...p, [k]: e.target.value }));
  const reset = () => setFilters({ name: '', category: 'any', location: '', availability: 'any' });

  const categories = Array.from(new Set(mockListings.map(l => l.category)));

  return (
    <div className="total-listings-page">
      <div className="page-header">
        <h2>All Listings</h2>
        <p className="muted">Manage platform listings — view, filter, or inspect gear cards.</p>
      </div>

      <div className="filter-bar">
        <input className="filter-input" placeholder="Name" value={filters.name} onChange={onChange('name')} />
        <select className="filter-select" value={filters.category} onChange={onChange('category')}>
          <option value="any">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input className="filter-input" placeholder="Location" value={filters.location} onChange={onChange('location')} />
        <select className="filter-select" value={filters.availability} onChange={onChange('availability')}>
          <option value="any">Any</option>
          <option value="available">Available</option>
          <option value="booked">Booked</option>
        </select>
        <div className="filter-actions"><button className="btn btn-outline" onClick={reset}>Reset</button></div>
      </div>

      <div className="listings-grid">
        {filtered.length === 0 ? (
          <div className="table-placeholder">No listings match the filters.</div>
        ) : (
          filtered.map((l) => (
            <div
              key={l.id}
              className="listing-card"
              role="button"
              tabIndex={0}
              onClick={() => onNavigate(`/gear/${l.id}`)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate(`/gear/${l.id}`); }}
            >
              <GearCard item={{ ...l }} />
            </div>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
};

export default TotalListings;
