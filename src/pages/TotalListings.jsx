import React, { useState, useMemo, useEffect } from 'react';
import './TotalListings.css';
import GearCard from '../components/GearCard';
import Footer from '../components/Footer';
import { apiRequest } from '../utils/api';
import EquipmentDetailModal from '../components/EquipmentDetailModal';

const TotalListings = ({ onNavigate }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ name: '', category: 'any', location: '', availability: 'any' });
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest('/equipment/');
      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(err.detail || `Server error: ${response.status}`);
      }
      const data = await response.json();
      // Map data to include image URLs from photo_binary
      const mappedData = data.map(item => {
        const isPng = item.photo_binary && item.photo_binary.startsWith('iVBOR');
        const mimeType = isPng ? 'image/png' : 'image/jpeg';
        const imageUrl = item.photo_binary 
          ? `data:${mimeType};base64,${item.photo_binary}` 
          : (item.photo_url || "https://via.placeholder.com/300x200?text=No+Image");
        return { ...item, image: imageUrl };
      });
      setListings(mappedData);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load listings: ' + (err.message || 'Unknown error'));
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (filters.name && !l.name.toLowerCase().includes(filters.name.trim().toLowerCase())) return false;
      if (filters.category !== 'any' && l.category !== filters.category) return false;
      if (filters.location && !l.pickup_location?.toLowerCase().includes(filters.location.trim().toLowerCase())) return false;
      if (filters.availability === 'available' && l.status !== 'available') return false;
      if (filters.availability === 'booked' && l.status === 'available') return false;
      return true;
    });
  }, [filters, listings]);

  const onChange = (k) => (e) => setFilters((p) => ({ ...p, [k]: e.target.value }));
  const reset = () => setFilters({ name: '', category: 'any', location: '', availability: 'any' });

  const categories = Array.from(new Set(listings.map(l => l.category)));

  return (
    <div className="total-listings-page">
      {selectedEquipment && (
        <EquipmentDetailModal
          equipment={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          onSave={async (updatedData) => {
            try {
              const formData = new FormData();
              formData.append('name', updatedData.name);
              formData.append('category', updatedData.category);
              formData.append('daily_price', updatedData.daily_price);
              formData.append('pickup_location', updatedData.pickup_location);
              formData.append('photo_url', updatedData.photo_url);
              formData.append('status', updatedData.status);

              const response = await apiRequest(`/equipment/${selectedEquipment.equipment_id}`, {
                method: 'PUT',
                headers: { 'owner_username': selectedEquipment.owner_username }, // Admin impersonating owner
                body: formData
              });

              if (response.ok) {
                alert('Equipment updated successfully');
                fetchListings(); // Refresh list
                setSelectedEquipment(null);
              } else {
                alert('Failed to update equipment');
              }
            } catch (err) {
              console.error(err);
              alert('Error updating equipment');
            }
          }}
        />
      )}
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
        {loading ? (
          <div className="table-placeholder">Loading listings...</div>
        ) : error ? (
          <div className="table-placeholder">Error: {error}</div>
        ) : filtered.length === 0 ? (
          <div className="table-placeholder">No listings match the filters.</div>
        ) : (
          filtered.map((l) => (
            <div
              key={l.equipment_id}
              className="listing-card"
              role="button"
              tabIndex={0}
              onClick={() => setSelectedEquipment(l)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedEquipment(l); }}
            >
              <GearCard item={{ ...l, id: l.equipment_id, isAvailable: l.status === 'available', location: l.pickup_location }} />
            </div>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
};

export default TotalListings;
