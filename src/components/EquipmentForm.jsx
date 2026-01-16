import React, { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import { apiRequest } from '../utils/api';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Leaflet map click handler component
const ClickHandler = ({ setPosition, name, onChange }) => {
  useMapEvents({
    click(e) {
      const coords = [e.latlng.lat, e.latlng.lng];
      setPosition(coords);
      onChange({ target: { name, value: `${coords[0]}, ${coords[1]}` } });
    },
  });
  return null;
};

const EquipmentForm = ({ item, userName, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || 'Photography',
    daily_price: item?.daily_price || '',
    photo_url: item?.photo_url || '',
    pickup_location: item?.pickup_location || '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapPosition, setMapPosition] = useState(
    item?.pickup_location
      ? item.pickup_location.split(',').map(Number)
      : null
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) setPhotoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('category', formData.category);
      submitData.append('daily_price', formData.daily_price);
      submitData.append('pickup_location', formData.pickup_location);
      if (photoFile) submitData.append('photo', photoFile);

      if (item?.equipment_id) {
        const response = await apiRequest(`/equipment/${item.equipment_id}`, {
          method: 'PUT',
          headers: { 'owner_username': userName },
          body: submitData,
        });
        if (response.ok) {
          alert('Equipment updated successfully!');
          onSave();
        } else {
          const err = await response.json();
          setError(err.detail || 'Failed to update equipment');
        }
      } else {
        const response = await apiRequest('/equipment/', {
          method: 'POST',
          headers: { 'owner_username': userName },
          body: submitData,
        });
        if (response.ok) {
          alert('Equipment added successfully!');
          onSave();
        } else {
          const err = await response.json();
          setError(err.detail || 'Failed to add equipment');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="equipment-form-modal">
      <div className="form-container">
        <h3>{item?.equipment_id ? 'Edit Equipment' : 'Add New Equipment'}</h3>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <Input
            label="Equipment Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
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

          <Input
            label="Daily Price (TK)"
            name="daily_price"
            type="number"
            step="0.01"
            value={formData.daily_price}
            onChange={handleChange}
            required
          />

          <div className="form-group">
            <label>Equipment Photo</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="form-input"
            />
          </div>

          {/* Pickup Location with Map */}
          <div className="form-group">
            <label>Pickup Location</label>
            <MapContainer
              center={mapPosition || [23.8103, 90.4125]} 
              zoom={12} 
              className="leaflet-container"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
              />
              <ClickHandler
                setPosition={setMapPosition}
                name="pickup_location"
                onChange={handleChange}
              />
              {mapPosition && <Marker position={mapPosition} />}
            </MapContainer>
            {formData.pickup_location && (
              <small>Selected: {formData.pickup_location}</small>
            )}
          </div>

          <div className="form-actions">
            <Button type="submit" variant="primary" isLoading={loading}>
              {item?.equipment_id ? 'Update Equipment' : 'Add Equipment'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentForm;
