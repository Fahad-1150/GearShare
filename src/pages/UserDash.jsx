import React, { useState, useEffect } from 'react';
import './UserDash.css';
import GearCard from '../components/GearCard.jsx';
import EquipmentForm from '../components/EquipmentForm';
import ReservationForm from '../components/ReservationForm';
import ReviewForm from '../components/ReviewForm';
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
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [userEquipment, setUserEquipment] = useState([]);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  
  // Reservation states
  const [incomingReservations, setIncomingReservations] = useState([]);
  const [outgoingReservations, setOutgoingReservations] = useState([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Review modal state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewingReservation, setReviewingReservation] = useState(null);
  const [reviewingEquipment, setReviewingEquipment] = useState(null);

  // Fetch user equipment on component mount
  useEffect(() => {
    const fetchUserEquipment = async () => {
      setEquipmentLoading(true);
      try {
        const response = await apiRequest(`/equipment/owner/${currentUsername}`);
        if (response.ok) {
          const data = await response.json();
          setUserEquipment(data);
        } else {
          console.error('Failed to fetch user equipment:', response.status);
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

  // Fetch reservations (both incoming and outgoing)
  useEffect(() => {
    const fetchReservations = async () => {
      setReservationsLoading(true);
      try {
        console.log('Fetching reservations for user:', currentUsername);
        
        // Fetch incoming reservations (as owner)
        try {
          const ownerResponse = await apiRequest(`/reservation/owner/${currentUsername}`);
          console.log('Owner response status:', ownerResponse.status);
          if (ownerResponse.ok) {
            const ownerData = await ownerResponse.json();
            console.log('Incoming reservations:', ownerData);
            setIncomingReservations(Array.isArray(ownerData) ? ownerData : []);
          } else {
            console.error('Failed to fetch incoming reservations:', ownerResponse.status);
            const errorText = await ownerResponse.text();
            console.error('Error:', errorText);
            setIncomingReservations([]);
          }
        } catch (err) {
          console.error('Error fetching incoming reservations:', err);
          setIncomingReservations([]);
        }

        // Fetch outgoing reservations (as reserver)
        try {
          const reserResponse = await apiRequest(`/reservation/reserver/${currentUsername}`);
          console.log('Reserver response status:', reserResponse.status);
          if (reserResponse.ok) {
            const reserData = await reserResponse.json();
            console.log('Outgoing reservations:', reserData);
            setOutgoingReservations(Array.isArray(reserData) ? reserData : []);
          } else {
            console.error('Failed to fetch outgoing reservations:', reserResponse.status);
            const errorText = await reserResponse.text();
            console.error('Error:', errorText);
            // ADD TEST DATA FOR DEVELOPMENT
            setOutgoingReservations([
              {
                reservation_id: 1,
                equipment_id: 1,
                owner_username: 'testowner',
                reserver_username: currentUsername,
                status: 'pending',
                start_date: '2026-01-20',
                end_date: '2026-01-25',
                per_day_price: 500,
                total_price: 2500,
                review_id: null
              }
            ]);
          }
        } catch (err) {
          console.error('Error fetching outgoing reservations:', err);
          setOutgoingReservations([]);
        }

        // Fetch total earnings for the owner
        try {
          const earningsResponse = await apiRequest(`/reservation/earnings/${currentUsername}`);
          if (earningsResponse.ok) {
            const earningsData = await earningsResponse.json();
            console.log('Total earnings:', earningsData);
            setTotalEarnings(earningsData.total_earnings || 0);
          } else {
            console.error('Failed to fetch earnings:', earningsResponse.status);
            setTotalEarnings(0);
          }
        } catch (err) {
          console.error('Error fetching earnings:', err);
          setTotalEarnings(0);
        }

        // Fetch average rating for the owner
        try {
          const ratingResponse = await apiRequest(`/api/review/owner/${currentUsername}/average-rating`);
          if (ratingResponse.ok) {
            const ratingData = await ratingResponse.json();
            console.log('Average rating:', ratingData);
            setAverageRating(ratingData.average_rating || 0);
            setTotalReviews(ratingData.total_reviews || 0);
          } else {
            console.error('Failed to fetch rating:', ratingResponse.status);
            setAverageRating(0);
            setTotalReviews(0);
          }
        } catch (err) {
          console.error('Error fetching rating:', err);
          setAverageRating(0);
          setTotalReviews(0);
        }
      } catch (error) {
        console.error('Failed to fetch reservations:', error);
      } finally {
        setReservationsLoading(false);
      }
    };

    if (currentUsername) {
      fetchReservations();
      // Refresh every 30 seconds
      const interval = setInterval(fetchReservations, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUsername]);

  const [rentalHistory, setRentalHistory] = useState([]);

  useEffect(() => {
    const history = [];

    // Process Incoming (Given) - I am the owner
    incomingReservations.forEach(res => {
      const equipment = userEquipment.find(e => e.equipment_id === res.equipment_id);
      history.push({
        id: res.reservation_id,
        itemName: equipment ? equipment.name : `Equipment #${res.equipment_id}`,
        category: equipment ? equipment.category : 'Unknown',
        price: res.total_price,
        rentDate: new Date(res.start_date).toLocaleDateString(),
        returnDate: new Date(res.end_date).toLocaleDateString(),
        status: res.status,
        rentTo: res.reserver_username,
        role: 'given',
      });
    });

    // Process Outgoing (Taken) - I am the reserver
    outgoingReservations.forEach(res => {
      history.push({
        id: res.reservation_id,
        itemName: `Equipment #${res.equipment_id}`,
        category: 'Rental',
        price: res.total_price,
        rentDate: new Date(res.start_date).toLocaleDateString(),
        returnDate: new Date(res.end_date).toLocaleDateString(),
        status: res.status,
        rentTo: res.owner_username,
        role: 'taken',
      });
    });

    setRentalHistory(history);
  }, [incomingReservations, outgoingReservations, userEquipment]);

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
      case 'running':
        return 'status-active';
      case 'returned':
        return 'status-warning'; // Or any other class for returned
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

  const handleAcceptReservation = async (reservationId) => {
    try {
      // First, get the reservation details to extract equipment_id and end_date
      const reservationsResponse = await apiRequest(`/reservation/${reservationId}`);
      if (!reservationsResponse.ok) {
        alert('Error fetching reservation details');
        return;
      }
      const reservationData = await reservationsResponse.json();
      const equipmentId = reservationData.equipment_id;
      const bookedTillDate = reservationData.end_date;

      // Update reservation status to running
      const response = await apiRequest(`/reservation/${reservationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'owner_username': currentUsername
        },
        body: JSON.stringify({ status: 'running' })
      });
      
      if (!response.ok) {
        const err = await response.json();
        alert('Error accepting reservation: ' + (err.detail || 'Unknown error'));
      } else {
        // Update equipment status to booked with booked_till date
        const formData = new FormData();
        formData.append('status', 'booked');
        formData.append('booked_till', bookedTillDate);

        try {
          const equipmentUpdateResponse = await fetch(`http://localhost:8000/equipment/${equipmentId}`, {
            method: 'PUT',
            headers: {
              'owner_username': currentUsername
            },
            body: formData
          });

          if (!equipmentUpdateResponse.ok) {
            const errorData = await equipmentUpdateResponse.json();
            console.error('Failed to update equipment status:', errorData);
          }
        } catch (error) {
          console.error('Error updating equipment:', error);
        }

        alert('Reservation accepted! Rental is now active.');
        // Refresh reservations and equipment
        const ownerResponse = await apiRequest(`/reservation/owner/${currentUsername}`, { method: 'GET' });
        if (ownerResponse.ok) {
          const ownerData = await ownerResponse.json();
          setIncomingReservations(Array.isArray(ownerData) ? ownerData : []);
        }

        // Refresh user equipment to update status
        const equipmentResponse = await apiRequest(`/equipment/owner/${currentUsername}`);
        if (equipmentResponse.ok) {
          const equipmentData = await equipmentResponse.json();
          setUserEquipment(equipmentData);
        }
      }
    } catch (error) {
      console.error('Failed to accept reservation:', error);
      alert('Failed to accept reservation');
    }
  };

  const handleRejectReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to reject this reservation?')) {
      return;
    }
    try {
      const response = await apiRequest(`/reservation/${reservationId}`, {
        method: 'DELETE',
        headers: { 'reserver_username': currentUsername } // Note: Backend currently restricts delete to reserver only
      });
      
      if (!response.ok) {
        const err = await response.json();
        alert('Error rejecting reservation: ' + (err.detail || 'Unknown error'));
      } else {
        alert('Reservation rejected!');
        // Refresh reservations
        const ownerResponse = await apiRequest(`/reservation/owner/${currentUsername}`, { method: 'GET' });
        if (ownerResponse.ok) {
          const ownerData = await ownerResponse.json();
          setIncomingReservations(Array.isArray(ownerData) ? ownerData : []);
        }
      }
    } catch (error) {
      console.error('Failed to reject reservation:', error);
      alert('Failed to reject reservation');
    }
  };

  const handleMarkAsReturned = async (reservationId) => {
    try {
      // Get reservation details to find equipment_id
      const reservationResponse = await apiRequest(`/reservation/${reservationId}`);
      if (!reservationResponse.ok) {
        alert('Error fetching reservation details');
        return;
      }
      const reservationData = await reservationResponse.json();
      const equipmentId = reservationData.equipment_id;

      const response = await apiRequest(`/reservation/${reservationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'owner_username': currentUsername
        },
        body: JSON.stringify({ status: 'returned' })
      });
      
      if (!response.ok) {
        const err = await response.json();
        alert('Error marking as returned: ' + (err.detail || 'Unknown error'));
      } else {
        // Update equipment status back to available
        const formData = new FormData();
        formData.append('status', 'available');
        formData.append('booked_till', '');

        try {
          await fetch(`http://localhost:8000/equipment/${equipmentId}`, {
            method: 'PUT',
            headers: {
              'owner_username': currentUsername
            },
            body: formData
          });
        } catch (error) {
          console.error('Error updating equipment status:', error);
        }

        alert('Equipment marked as returned! Awaiting owner confirmation.');
        // Refresh reservations
        const ownerResponse = await apiRequest(`/reservation/owner/${currentUsername}`, { method: 'GET' });
        if (ownerResponse.ok) {
          const ownerData = await ownerResponse.json();
          setIncomingReservations(Array.isArray(ownerData) ? ownerData : []);
        }

        // Refresh user equipment
        const equipmentResponse = await apiRequest(`/equipment/owner/${currentUsername}`);
        if (equipmentResponse.ok) {
          const equipmentData = await equipmentResponse.json();
          setUserEquipment(equipmentData);
        }
      }
    } catch (error) {
      console.error('Failed to mark as returned:', error);
      alert('Failed to mark equipment as returned');
    }
  };

  const handleConfirmReturn = async (reservationId) => {
    try {
      // Get reservation details to find equipment_id
      const reservationResponse = await apiRequest(`/reservation/${reservationId}`);
      if (!reservationResponse.ok) {
        alert('Error fetching reservation details');
        return;
      }
      const reservationData = await reservationResponse.json();
      const equipmentId = reservationData.equipment_id;

      const response = await apiRequest(`/reservation/${reservationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'owner_username': currentUsername
        },
        body: JSON.stringify({ status: 'completed' })
      });
      
      if (!response.ok) {
        const err = await response.json();
        alert('Error confirming return: ' + (err.detail || 'Unknown error'));
      } else {
        // Update equipment status back to available
        const formData = new FormData();
        formData.append('status', 'available');
        formData.append('booked_till', '');

        try {
          await fetch(`http://localhost:8000/equipment/${equipmentId}`, {
            method: 'PUT',
            headers: {
              'owner_username': currentUsername
            },
            body: formData
          });
        } catch (error) {
          console.error('Error updating equipment status:', error);
        }

        alert('Return confirmed! Rental is complete.');
        // Refresh reservations
        const ownerResponse = await apiRequest(`/reservation/owner/${currentUsername}`, { method: 'GET' });
        if (ownerResponse.ok) {
          const ownerData = await ownerResponse.json();
          setIncomingReservations(Array.isArray(ownerData) ? ownerData : []);
        }

        // Refresh user equipment
        const equipmentResponse = await apiRequest(`/equipment/owner/${currentUsername}`);
        if (equipmentResponse.ok) {
          const equipmentData = await equipmentResponse.json();
          setUserEquipment(equipmentData);
        }
      }
    } catch (error) {
      console.error('Failed to confirm return:', error);
      alert('Failed to confirm return');
    }
  };

  const handleOpenReviewForm = async (reservation) => {
    try {
      const equipmentResponse = await apiRequest(`/equipment/${reservation.equipment_id}`);
      if (equipmentResponse.ok) {
        const equipmentData = await equipmentResponse.json();
        setReviewingReservation(reservation);
        setReviewingEquipment(equipmentData);
        setShowReviewForm(true);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      alert('Failed to load equipment details');
    }
  };

  const handleReviewSuccess = () => {
    // Refresh reservations after review is submitted
    const fetchReservations = async () => {
      try {
        const reserResponse = await apiRequest(`/reservation/reserver/${currentUsername}`);
        if (reserResponse.ok) {
          const reserData = await reserResponse.json();
          setOutgoingReservations(Array.isArray(reserData) ? reserData : []);
        }
      } catch (err) {
        console.error('Error refreshing reservations:', err);
      }
    };
    fetchReservations();
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
          className={`tab-button ${activeTab === 'reservations' ? 'active' : ''}`}
          onClick={() => setActiveTab('reservations')}
        >
          My Reservations
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

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div className="reservations-section">
            <div className="reservations-header">
              <h2 className="section-title">My Reservations</h2>
            </div>

            {reservationsLoading ? (
              <div className="loading">Loading your reservations...</div>
            ) : (
              <>
                {/* Incoming Reservations */}
                <div className="reservation-subsection">
                  <h3 className="subsection-title">Requests to Rent Your Equipment</h3>
                  {incomingReservations.filter(res => res.status === 'pending').length > 0 ? (
                    <div className="reservations-table">
                      <div className="table-header">
                        <div className="col col-equipment">Equipment</div>
                        <div className="col col-dates">Dates</div>
                        <div className="col col-reserver">Reserver</div>
                        <div className="col col-price">Total Price</div>
                        <div className="col col-status">Status</div>
                        <div className="col col-actions">Actions</div>
                      </div>
                      {incomingReservations.filter(res => res.status === 'pending').map((res) => (
                        <div key={res.reservation_id} className="table-row">
                          <div className="col col-equipment">
                            <strong>Equipment #{res.equipment_id}</strong>
                          </div>
                          <div className="col col-dates">
                            <span className="date-range">
                              {new Date(res.start_date).toLocaleDateString()} → {new Date(res.end_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="col col-reserver">{res.reserver_username}</div>
                          <div className="col col-price">৳{res.total_price?.toFixed(2) || '0.00'}</div>
                          <div className="col col-status">
                            <span className={`status-badge status-${res.status}`}>
                              {res.status === 'running' ? 'In Rent' : (res.status?.charAt(0).toUpperCase() + res.status?.slice(1) || 'Pending')}
                            </span>
                          </div>
                          <div className="col col-actions">
                            {res.status === 'pending' && (
                              <>
                                <button 
                                  className="action-btn accept-btn"
                                  onClick={() => handleAcceptReservation(res.reservation_id)}
                                  title="Accept and start rental"
                                >
                                  ✓ Accept
                                </button>
                                <button 
                                  className="action-btn reject-btn"
                                  onClick={() => handleRejectReservation(res.reservation_id)}
                                  title="Reject"
                                >
                                  ✕ Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>No incoming reservation requests</p>
                    </div>
                  )}
                </div>

                {/* Outgoing Reservations */}
                <div className="reservation-subsection">
                  <h3 className="subsection-title">Your Rental Requests</h3>
                  {outgoingReservations.filter(res => res.status === 'pending').length > 0 ? (
                    <div className="reservations-table">
                      <div className="table-header">
                        <div className="col col-equipment">Equipment</div>
                        <div className="col col-dates">Dates</div>
                        <div className="col col-owner">Owner</div>
                        <div className="col col-price">Total Price</div>
                        <div className="col col-status">Status</div>
                        <div className="col col-actions">Actions</div>
                      </div>
                      {outgoingReservations.filter(res => res.status === 'pending').map((res) => (
                        <div key={res.reservation_id} className="table-row">
                          <div className="col col-equipment">
                            <strong>Equipment #{res.equipment_id}</strong>
                          </div>
                          <div className="col col-dates">
                            <span className="date-range">
                              {new Date(res.start_date).toLocaleDateString()} → {new Date(res.end_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="col col-owner">{res.owner_username}</div>
                          <div className="col col-price">৳{res.total_price?.toFixed(2) || '0.00'}</div>
                          <div className="col col-status">
                            <span className={`status-badge status-${res.status}`}>
                              {res.status === 'running' ? 'In Rent' : (res.status?.charAt(0).toUpperCase() + res.status?.slice(1) || 'Pending')}
                            </span>
                          </div>
                          <div className="col col-actions">
                            <button 
                              className="action-btn reject-btn"
                              onClick={() => handleRejectReservation(res.reservation_id)}
                              title="Cancel your rental request"
                            >
                              ✕ Cancel Request
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>No active rental requests</p>
                    </div>
                  )}
                </div>

                {/* Completed Rentals - Write Review */}
                <div className="reservation-subsection">
                  <h3 className="subsection-title">Completed Rentals (Write Review)</h3>
                  {outgoingReservations.filter(res => res.status === 'completed').length > 0 ? (
                    <div className="reservations-table">
                      <div className="table-header">
                        <div className="col col-equipment">Equipment</div>
                        <div className="col col-dates">Rental Period</div>
                        <div className="col col-owner">Owner</div>
                        <div className="col col-price">Total Price</div>
                        <div className="col col-actions">Action</div>
                      </div>
                      {outgoingReservations.filter(res => res.status === 'completed').map((res) => (
                        <div key={res.reservation_id} className="table-row">
                          <div className="col col-equipment">
                            <strong>Equipment #{res.equipment_id}</strong>
                          </div>
                          <div className="col col-dates">
                            <span className="date-range">
                              {new Date(res.start_date).toLocaleDateString()} → {new Date(res.end_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="col col-owner">{res.owner_username}</div>
                          <div className="col col-price">৳{res.total_price?.toFixed(2) || '0.00'}</div>
                          <div className="col col-actions">
                            <button 
                              className="action-btn review-btn"
                              onClick={() => handleOpenReviewForm(res)}
                              title="Write a review"
                              style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                            >
                              ⭐ Write Review
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>No completed rentals to review</p>
                    </div>
                  )}
                </div>
              </>
            )}
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
                  <span className="overview-value">৳{totalEarnings.toFixed(2)}</span>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-icon">📦</div>
                <div className="overview-info">
                  <span className="overview-label">Items Listed</span>
                  <span className="overview-value">{userEquipment.length}</span>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-icon">⭐</div>
                <div className="overview-info">
                  <span className="overview-label">Your Rating</span>
                  <span className="overview-value">{averageRating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-icon">🔄</div>
                <div className="overview-info">
                  <span className="overview-label">Total Rentals</span>
                  <span className="overview-value">{incomingReservations.length}</span>
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
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="given">Given by me (Lender)</option>
                <option value="taken">Reserved by me (Renter)</option>
              </select>
              <select 
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="running">In Rent</option>
                <option value="returned">Returned</option>
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
                    <th>User / Owner</th>
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
                      const matchesRole = roleFilter === 'all' || rental.role === roleFilter;
                      const matchesSearch = rental.itemName.toLowerCase().includes(searchTerm.toLowerCase());
                      return matchesStatus && matchesRole && matchesSearch;
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
                      <td className={`status-text ${getStatusClass(rental.status)}`}>
                        {rental.status === 'running' ? 'In Rent' : (rental.status.charAt(0).toUpperCase() + rental.status.slice(1))}
                      </td>
                      <td>
                        {/* Actions for Owner (Given) */}
                        {rental.role === 'given' && rental.status === 'running' && (
                          <button 
                            className="action-btn returned-btn"
                            onClick={() => handleMarkAsReturned(rental.id)}
                            title="Mark equipment as returned"
                            style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                          >
                            ↩ Returned
                          </button>
                        )}
                        {rental.role === 'given' && rental.status === 'returned' && (
                          <button 
                            className="action-btn confirm-btn"
                            onClick={() => handleConfirmReturn(rental.id)}
                            title="Confirm return complete"
                            style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                          >
                            ✓ Confirm
                          </button>
                        )}
                        {/* Review button for renter on returned rentals */}
                        {rental.role === 'taken' && rental.status === 'returned' && (
                          <button 
                            className="action-btn review-btn"
                            onClick={() => {
                              const reservation = outgoingReservations.find(r => r.reservation_id === rental.id);
                              if (reservation) {
                                handleOpenReviewForm(reservation);
                              }
                            }}
                            title="Write a review"
                            style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                          >
                            ⭐ Review
                          </button>
                        )}
                        {/* General View Button */}
                        {rental.status === 'completed' && rental.role === 'given' && (
                          <span className="status-complete" style={{ fontSize: '0.8rem' }}>✓ Done</span>
                        )}
                        {rental.status === 'pending' && (
                          <span style={{ fontSize: '0.8rem', color: '#f59e0b' }}>Pending</span>
                        )}
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

        {/* Review Form Modal */}
        {showReviewForm && reviewingReservation && reviewingEquipment && (
          <ReviewForm
            reservation={reviewingReservation}
            equipment={reviewingEquipment}
            onClose={() => {
              setShowReviewForm(false);
              setReviewingReservation(null);
              setReviewingEquipment(null);
            }}
            onSuccess={handleReviewSuccess}
          />
        )}
      </div>
       <Footer/>
    </div>
  );
}

export default UserDash;
