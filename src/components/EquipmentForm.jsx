import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import { apiRequest } from '../utils/api';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (item?.equipment_id) {
        // Update equipment
        const response = await apiRequest(`/equipment/${item.equipment_id}`, {
          method: 'PUT',
          headers: { 'owner_username': userName },
          body: JSON.stringify(formData),
        });
        
        if (response.ok) {
          alert('Equipment updated successfully!');
          onSave();
        } else {
          const error = await response.json();
          setError(error.detail || 'Failed to update equipment');
        }
      } else {
        // Create new equipment
        // Create new equipment with FormData for file upload
        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('category', formData.category);
        submitData.append('daily_price', formData.daily_price);
        submitData.append('pickup_location', formData.pickup_location);
        if (photoFile) {
          submitData.append('photo', photoFile);
        }

        const response = await apiRequest('/equipment/', {
          method: 'POST',
          headers: { 'owner_username': userName },
          body: submitData,
        });

        if (response.ok) {
          alert('Equipment added successfully!');
          onSave();
        } else {
          const error = await response.json();
          setError(error.detail || 'Failed to add equipment');
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

          <Input
            label="Pickup Location"
            name="pickup_location"
            value={formData.pickup_location}
            onChange={handleChange}
            placeholder="e.g., Dhaka, Bangladesh"
          />

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
