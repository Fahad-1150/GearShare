import React, { useState, useEffect } from 'react';
import './UserDash.css';
import GearCard from '../components/GearCard.jsx';
import EquipmentForm from '../components/EquipmentForm';
import { apiRequest } from '../utils/api';
import '../components/EquipmentForm.css';
import Footer from '../components/Footer.jsx'

function UserDash({ userData: passedUserData, setUserData, onNavigate }) {
  const [activeTab, setActiveTab] = useState('equipments');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [reportType, setReportType] = useState('rental');
  const [dateRange, setDateRange] = useState({ start: '2026-01-01', end: '2026-01-09' });
  const [generatingReport, setGeneratingReport] = useState(false);
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
  // Use UserName_PK from API or name from mock data
  const currentUsername = userData.UserName_PK || userData.name;

  const [rentalView, setRentalView] = useState('taken');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [userEquipment, setUserEquipment] = useState([]);
  const [equipmentLoading, setEquipmentLoading] = useState(false);

  // Fetch user equipment on component mount
  useEffect(() => {
    const fetchUserEquipment = async () => {
      setEquipmentLoading(true);
      try {
        const response = await apiRequest(`/equipment/owner/${currentUsername}`, {
          method: 'GET'
        });
        if (response.ok) {
          const data = await response.json();
          setUserEquipment(data);
        }
      } catch (error) {
        console.error('Failed to fetch user equipment:', error);
      } finally {
        setEquipmentLoading(false);
      }
    };

    if (currentUsername) {
      fetchUserEquipment();
    }
  }, [currentUsername]);

  // Mock data for rental history
  const rentalHistory = [
    {
      id: 1,
      itemName: 'Sony A7 IV Camera',
      category: 'Photography',
      price: 2000,
      rentDate: '15 Dec 2024',
      returnDate: '20 Dec 2024',
      status: 'completed',
      rentTo: 'John Smith',
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
      rentTo: 'Sarah Johnson',
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
      rentTo: 'Mike Chen',
      role: 'given',
    },
    {
      id: 4,
      itemName: 'Canon EOS R5',
      category: 'Photography',
      price: 2500,
      rentDate: '01 Jan 2025',
      returnDate: '07 Jan 2025',
      status: 'completed',
      rentTo: 'Emily Davis',
      role: 'given',
    },
    {
      id: 5,
      itemName: 'GoPro Hero 12',
      category: 'Action Camera',
      price: 500,
      rentDate: '08 Jan 2025',
      returnDate: 'Expected 12 Jan 2025',
      status: 'in rent',
      rentTo: 'Alex Turner',
      role: 'taken',
    },
    {
      id: 6,
      itemName: 'Rode Wireless Pro',
      category: 'Audio',
      price: 350,
      rentDate: '03 Jan 2025',
      returnDate: '06 Jan 2025',
      status: 'completed',
      rentTo: 'Lisa Wong',
      role: 'given',
    },
    {
      id: 7,
      itemName: 'DJI RS 3 Pro Gimbal',
      category: 'Stabilizer',
      price: 800,
      rentDate: '09 Jan 2025',
      returnDate: 'Expected 14 Jan 2025',
      status: 'pending',
      rentTo: 'David Brown',
      role: 'taken',
    },
    {
      id: 8,
      itemName: 'Aputure 600d Pro',
      category: 'Lighting',
      price: 1500,
      rentDate: '02 Jan 2025',
      returnDate: '05 Jan 2025',
      status: 'completed',
      rentTo: 'Rachel Green',
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

  const handleAddEquipment = () => {
    setEditingEquipment(null);
    setShowEquipmentForm(true);
  };

  const handleEditEquipment = (item) => {
    setEditingEquipment(item);
    setShowEquipmentForm(true);
  };

  const handleDeleteEquipment = async (equipmentId) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        const response = await apiRequest(`/equipment/${equipmentId}`, {
          method: 'DELETE',
          headers: { 'owner_username': currentUsername }
        });
        if (response.ok) {
          setUserEquipment(userEquipment.filter(item => item.equipment_id !== equipmentId));
          alert('Equipment deleted successfully!');
        } else {
          alert('Failed to delete equipment');
        }
      } catch (error) {
        console.error('Failed to delete equipment:', error);
        alert('Network error. Please try again.');
      }
    }
  };

  const handleEquipmentFormClose = () => {
    setShowEquipmentForm(false);
    setEditingEquipment(null);
  };

  const handleEquipmentFormSave = async () => {
    // Refresh equipment list
    try {
      const response = await apiRequest(`/equipment/owner/${currentUsername}`, {
        method: 'GET'
      });
      if (response.ok) {
        const data = await response.json();
        setUserEquipment(data);
      }
    } catch (error) {
      console.error('Failed to refresh equipment:', error);
    }
    handleEquipmentFormClose();
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

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'completed':
      case 'active':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'in rent':
        return 'status-active';
      default:
        return '';
    }
  };

  const handleGenerateReport = () => {
    setGeneratingReport(true);
    setTimeout(() => {
      setGeneratingReport(false);
      alert(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report generated for ${dateRange.start} to ${dateRange.end}`);
    }, 2000);
  };

  return (
    <div className="dashboard-wrapper">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="user-profile-card">
            <img src={userData.avatar} alt={userData.name} className="user-avatar" />
            <div className="user-info">
              <h1 className="user-name">{currentUsername}</h1>
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
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Dashboard Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          My Analytics
        </button>
        <button
          className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          My Reports
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Equipments Tab */}
        {activeTab === 'equipments' && (
          <div className="listings-section">
            <div className="listings-header">
              <div className="section-title">My Equipments</div>
              <button className="add-listing-btn" onClick={handleAddEquipment}>+ Add Equipment</button>
            </div>
            {equipmentLoading ? (
              <div className="loading">Loading your equipment...</div>
            ) : userEquipment.length > 0 ? (
              <div className="listings-grid card-grid">
                {userEquipment.map((item) => (
                  <div key={item.equipment_id} className="card-container">
                    <GearCard item={{
                      id: item.equipment_id,
                      name: item.name,
                      category: item.category,
                      price: parseFloat(item.daily_price),
                      rating: parseFloat(item.rating_avg) || 0,
                      reviews: item.rating_count || 0,
                      image: item.photo_binary ? `data:image/jpeg;base64,${item.photo_binary}` : (item.photo_url || 'https://via.placeholder.com/300x200?text=No+Image'),
                      owner: item.owner_username,
                      location: item.pickup_location || 'Location not specified',
                      isAvailable: item.status === 'available',
                      availableDate: item.booked_till
                    }} />
                    <div style={{ 
                      marginTop: '10px', 
                      padding: '8px', 
                      background: item.status === 'available' ? '#dcfce7' : '#fee2e2', 
                      color: item.status === 'available' ? '#166534' : '#991b1b',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontWeight: '600'
                    }}>
                      Status: {item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1)) : 'Unknown'}
                    </div>
                    <div className="card-actions">
                      <button className="action-btn edit" onClick={() => handleEditEquipment(item)}>Edit</button>
                      <button className="action-btn delete" onClick={() => handleDeleteEquipment(item.equipment_id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-equipment">
                <p>You haven't added any equipment yet. Start sharing your gear!</p>
                <button className="add-listing-btn" onClick={handleAddEquipment}>+ Add Your First Equipment</button>
              </div>
            )}
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="admin-section">
            <h2>Your Dashboard Overview</h2>
            <p className="section-desc">View your personal statistics and rental activity at a glance.</p>
            <div className="overview-grid">
              <div className="overview-card">
                <div className="overview-icon">💰</div>
                <div className="overview-info">
                  <span className="overview-label">Total Earnings</span>
                  <span className="overview-value">৳{listedItems.reduce((sum, item) => sum + (item.price * item.rents), 0)}</span>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-icon">📦</div>
                <div className="overview-info">
                  <span className="overview-label">Items Listed</span>
                  <span className="overview-value">{listedItems.length}</span>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-icon">⭐</div>
                <div className="overview-info">
                  <span className="overview-label">Your Rating</span>
                  <span className="overview-value">{userData.rating}</span>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-icon">🔄</div>
                <div className="overview-info">
                  <span className="overview-label">Total Rentals</span>
                  <span className="overview-value">{userData.totalRents}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="admin-section">
            <h2>My Rental Analytics</h2>
            <p className="section-desc">Detailed view of your rental transactions and performance metrics.</p>
            
            <div className="history-filters">
              <input 
                type="text" 
                placeholder="Search by item name..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select 
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="in rent">In Rent</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="table-container">
              <table className="rental-table">
                <thead>
                  <tr>
                    <th>Rental ID</th>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Rent To</th>
                    <th>Rent Date</th>
                    <th>Return Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rentalHistory
                    .filter((rental) => {
                      const matchesStatus = statusFilter === 'all' || rental.status.toLowerCase() === statusFilter.toLowerCase();
                      const matchesSearch = rental.itemName.toLowerCase().includes(searchTerm.toLowerCase());
                      return matchesStatus && matchesSearch;
                    })
                    .map((rental) => (
                    <tr key={rental.id}>
                      <td><span className="rental-id">{rental.id}</span></td>
                      <td>{rental.itemName}</td>
                      <td>{rental.category}</td>
                      <td>{rental.rentTo}</td>
                      <td>{rental.rentDate}</td>
                      <td>{rental.returnDate}</td>
                      <td><strong>৳{rental.price}</strong></td>
                      <td className={`status-text ${getStatusClass(rental.status)}`}>{rental.status}</td>
                      <td>
                        <button className="action-btn view-btn">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="admin-section">
            <h2>Generate Personal Reports</h2>
            <p className="section-desc">Create detailed reports for your rental activity and earnings analysis.</p>

            <div className="report-generator">
              <div className="report-options">
                <div className="report-type-selector">
                  <h3>Report Type</h3>
                  <div className="report-types">
                    <label className={`report-type-card ${reportType === 'rental' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="reportType"
                        value="rental"
                        checked={reportType === 'rental'}
                        onChange={(e) => setReportType(e.target.value)}
                      />
                      <span className="report-icon">📋</span>
                      <span className="report-name">Rental Report</span>
                      <span className="report-desc">Your rental transactions</span>
                    </label>
                    <label className={`report-type-card ${reportType === 'revenue' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="reportType"
                        value="revenue"
                        checked={reportType === 'revenue'}
                        onChange={(e) => setReportType(e.target.value)}
                      />
                      <span className="report-icon">💰</span>
                      <span className="report-name">Earnings Report</span>
                      <span className="report-desc">Your total earnings & income</span>
                    </label>
                    <label className={`report-type-card ${reportType === 'user' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="reportType"
                        value="user"
                        checked={reportType === 'user'}
                        onChange={(e) => setReportType(e.target.value)}
                      />
                      <span className="report-icon">📊</span>
                      <span className="report-name">Performance Report</span>
                      <span className="report-desc">Your ratings & reviews</span>
                    </label>
                    <label className={`report-type-card ${reportType === 'listing' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="reportType"
                        value="listing"
                        checked={reportType === 'listing'}
                        onChange={(e) => setReportType(e.target.value)}
                      />
                      <span className="report-icon">📦</span>
                      <span className="report-name">Listing Report</span>
                      <span className="report-desc">Your item performance</span>
                    </label>
                  </div>
                </div>

                <div className="date-range-selector">
                  <h3>Date Range</h3>
                  <div className="date-inputs">
                    <div className="date-field">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      />
                    </div>
                    <div className="date-field">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="quick-ranges">
                    <button onClick={() => setDateRange({ start: '2026-01-01', end: '2026-01-09' })}>This Week</button>
                    <button onClick={() => setDateRange({ start: '2026-01-01', end: '2026-01-31' })}>This Month</button>
                    <button onClick={() => setDateRange({ start: '2025-10-01', end: '2025-12-31' })}>Last Quarter</button>
                    <button onClick={() => setDateRange({ start: '2025-01-01', end: '2025-12-31' })}>Last Year</button>
                  </div>
                </div>
              </div>

              <div className="report-actions">
                <button 
                  className="btn generate-btn" 
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                >
                  {generatingReport ? (
                    <>
                      <span className="spinner"></span> Generating...
                    </>
                  ) : (
                    <>📊 Generate Report</>
                  )}
                </button>
                <button className="btn btn-outline">
                  📥 Export as CSV
                </button>
                <button className="btn btn-outline">
                  📄 Export as PDF
                </button>
              </div>
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

        {/* Equipment Form Modal */}
        {showEquipmentForm && (
          <EquipmentForm
            item={editingEquipment}
            userName={currentUsername}
            onClose={handleEquipmentFormClose}
            onSave={handleEquipmentFormSave}
          />
        )}
      </div>
       <Footer/>
    </div>
  );
}

export default UserDash;
