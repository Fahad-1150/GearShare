import React, { useState } from 'react';
import './UserDash.css';
import GearCard from '../components/GearCard.jsx';

function UserDash({ userData: passedUserData, setUserData, onNavigate }) {
  const [activeTab, setActiveTab] = useState('equipments');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [localUserData, setLocalUserData] = useState(passedUserData || {
    name: 'Bapon Das',
    email: 'bapon@gearshare.com',
    location: 'Feni, Bangladesh',
    memberSince: 'January 2024',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BaponDas',
    rating: 4.9,
    reviews: 124,
    totalRents: 45,
  });

  const userData = passedUserData || localUserData;

  const [rentalView, setRentalView] = useState('taken');

  const rentalHistory = [
    {
      id: 1,
      itemName: 'Sony A7 IV Camera',
      category: 'Photography',
      price: 2000,
      rentDate: '15 Dec 2024',
      returnDate: '20 Dec 2024',
      status: 'completed',
      role: 'taken',
    },
    {
      id: 2,
      itemName: 'DJI Air 3 Drone',
      category: 'Aerial',
      price: 900,
      rentDate: '10 Jan 2025',
      returnDate: 'Expected 15 Jan 2025',
      status: 'in rent',
      role: 'taken',
    },
    {
      id: 3,
      itemName: 'MacBook Pro 16"',
      category: 'Technology',
      price: 1200,
      rentDate: '05 Jan 2025',
      returnDate: '12 Jan 2025',
      status: 'pending',
      role: 'given',
    },
  ];

  const [listedItems, setListedItems] = useState([
    {
      id: 1,
      name: 'Canon EOS R5',
      category: 'Photography',
      price: 1800,
      image: 'https://images.unsplash.com/photo-1606986628025-35d57e735ae0?auto=format&fit=crop&q=80&w=400',
      rents: 12,
      rating: 4.8,
    },
    {
      id: 2,
      name: 'LED Light Kit',
      category: 'Lighting',
      price: 400,
      image: 'https://images.unsplash.com/photo-1590478976570-2e29bb23e5b1?auto=format&fit=crop&q=80&w=400',
      rents: 8,
      rating: 4.7,
    },
  ]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setLocalUserData({
      ...localUserData,
      [name]: value,
    });
    if (setUserData) {
      setUserData({
        ...localUserData,
        [name]: value,
      });
    }
  };

  const handleSaveProfile = () => {
    if (setUserData) {
      setUserData(localUserData);
    }
    setIsEditingProfile(false);
  };

  const handleEditItem = (item) => {
    setEditingItem({ ...item });
  };

  const handleSaveItem = () => {
    setListedItems(listedItems.map(item => item.id === editingItem.id ? editingItem : item));
    setEditingItem(null);
  };

  const handleDeleteItem = (id) => {
    setListedItems(listedItems.filter(item => item.id !== id));
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setEditingItem({
      ...editingItem,
      [name]: name === 'price' || name === 'rents' ? parseFloat(value) : value,
    });
  };

  const stats = [
    { label: 'Total Rentals', value: userData.totalRents },
    { label: 'Average Rating', value: userData.rating },
    { label: 'Total Reviews', value: userData.reviews },
    { label: 'Member Since', value: 'Jan 2024' },
  ];

  return (
    <div className="dashboard-wrapper">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="user-profile-card">
            <img src={userData.avatar} alt={userData.name} className="user-avatar" />
            <div className="user-info">
              <h1 className="user-name">{userData.name}</h1>
              <p className="user-email">{userData.email}</p>
              <p className="user-location">📍 {userData.location}</p>
            </div>
          </div>
          <button className="edit-profile-btn" onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="modal-overlay" onClick={() => setIsEditingProfile(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Profile</h2>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={localUserData.name}
                onChange={handleProfileChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={localUserData.email}
                onChange={handleProfileChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={localUserData.location}
                onChange={handleProfileChange}
                className="form-input"
              />
            </div>
            <div className="modal-buttons">
              <button className="btn-save" onClick={handleSaveProfile}>Save Changes</button>
              <button className="btn-cancel" onClick={() => setIsEditingProfile(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      

      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'equipments' ? 'active' : ''}`}
          onClick={() => setActiveTab('equipments')}
        >
          My Equipments
        </button>
        <button
          className={`tab-button ${activeTab === 'rentals' ? 'active' : ''}`}
          onClick={() => setActiveTab('rentals')}
        >
          Rental History
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Equipments Tab */}
        {activeTab === 'equipments' && (
          <div className="listings-section">
            <div className="listings-header">
              <div className="section-title">My Equipments</div>
              <button className="add-listing-btn">+ Add Equipment</button>
            </div>
            <div className="listings-grid card-grid">
              {listedItems.map((item) => (
                <div key={item.id} className="card-container">
                  <GearCard item={{ ...item, isAvailable: item.isAvailable !== false, availableDate: item.availableDate || null, location: item.location || 'Your area' }} />
                  <div className="card-actions">
                    <button className="action-btn edit" onClick={() => handleEditItem(item)}>Edit</button>
                    <button className="action-btn delete" onClick={() => handleDeleteItem(item.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rentals Tab */}
        {activeTab === 'rentals' && (
          <div className="rentals-section">
            <div className="section-title">Rental History</div>
            <div className="rental-filters" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button className={`tab-button ${rentalView === 'taken' ? 'active' : ''}`} onClick={() => setRentalView('taken')}>Taken (You Rented)</button>
              <button className={`tab-button ${rentalView === 'given' ? 'active' : ''}`} onClick={() => setRentalView('given')}>Given (You Lent)</button>
            </div>
            <div className="rental-table">
              <div className="table-header">
                <div className="col col-item">Item</div>
                <div className="col col-dates">Rental Period</div>
                <div className="col col-price">Price</div>
                <div className="col col-status">Status</div>
              </div>
              {rentalHistory.filter(r => r.role === rentalView).map((rental) => (
                <div key={rental.id} className="table-row">
                  <div className="col col-item">
                    <strong>{rental.itemName}</strong>
                    <span className="category">{rental.category}</span>
                  </div>
                  <div className="col col-dates">
                    <span>{rental.rentDate}</span>
                    <span>{rental.returnDate}</span>
                  </div>
                  <div className="col col-price">৳{rental.price}</div>
                  <div className="col col-status">
                    <span className={`status-badge ${rental.status === 'completed' ? 'status-completed' : (rental.status === 'in rent' ? 'status-active' : 'status-pending')}`}>
                      {rental.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="listings-section">
            <div className="listings-header">
              <div className="section-title">Your Listed Items</div>
              <button className="add-listing-btn">+ Add New Item</button>
            </div>
            <div className="listings-grid">
              {listedItems.map((item) => (
                <div key={item.id} className="listing-card">
                  <div className="listing-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="listing-info">
                    <h3>{item.name}</h3>
                    <p className="listing-category">{item.category}</p>
                    <div className="listing-stats">
                      <span>⭐ {item.rating}</span>
                      <span>🔄 {item.rents} rents</span>
                      <span className="price">৳{item.price}/day</span>
                    </div>
                    <div className="listing-actions">
                      <button className="action-btn edit" onClick={() => handleEditItem(item)}>Edit</button>
                      <button className="action-btn delete" onClick={() => handleDeleteItem(item.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {editingItem && (
          <div className="modal-overlay" onClick={() => setEditingItem(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Edit Item</h2>
              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  name="name"
                  value={editingItem.name}
                  onChange={handleItemChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={editingItem.category}
                  onChange={handleItemChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Price (per day in Taka)</label>
                <input
                  type="number"
                  name="price"
                  value={editingItem.price}
                  onChange={handleItemChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={editingItem.image}
                  onChange={handleItemChange}
                  className="form-input"
                />
              </div>
              <div className="modal-buttons">
                <button className="btn-save" onClick={handleSaveItem}>Save Changes</button>
                <button className="btn-cancel" onClick={() => setEditingItem(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDash;
