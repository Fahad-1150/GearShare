import React, { useState, useEffect } from 'react';
import GearCard from '../components/GearCard';
import GearDetails from './GearDetails'; 
import { apiRequest } from '../utils/api';
import './home.css';
import logo from '../images/logo.png';
import Footer from '../components/Footer';

const MOCK_GEAR = [
  { 
    id: 1, 
    name: "Sony A7 IV Mirrorless Camera", 
    category: "Photography", 
    price: 2000, 
    rating: 4.9, 
    reviews: 124, 
    image: "https://4.img-dpreview.com/files/p/E~TS1180x0~articles/9494401150/Product-Images/Sony_alpha_7IV_beauty.jpeg", 
    owner: "Nazmul", 
    ownerId: "OWN-8821",
    location: "Feni",
    isAvailable: true,
    availableDate: null,
    reviewsData: [
      { id: 1, user: "Sakib", rating: 5, date: "Oct 2023", comment: "Crystal clear quality. The autofocus is magic." },
      { id: 2, user: "Mitu", rating: 4, date: "Sept 2023", comment: "Great camera, but make sure to bring extra batteries!" },
      { id: 3, user: "Joy", rating: 5, date: "Aug 2023", comment: "Used it for a wedding shoot. Perfect." },
      { id: 4, user: "Emon", rating: 5, date: "July 2023", comment: "Professional gear in great condition." }
    ]
  },
  { 
    id: 2, 
    name: "Gopro 5 Black Edition", 
    category: "Outdoor", 
    price: 450, 
    rating: 4.8, 
    reviews: 89, 
    image: "https://media.dcrainmaker.com/images/2016/10/GoPro-Hero5-Black-Front-Shot_thumb.jpg", 
    owner: "Haque", 
    ownerId: "OWN-4412",
    location: "Comilla",
    isAvailable: false, 
    availableDate: "08-Dec-2025",
    reviewsData: [
      { id: 1, user: "Rana", rating: 5, date: "Nov 2023", comment: "Took this to Sajek. Amazing stabilization." },
      { id: 2, user: "Adnan", rating: 5, date: "Oct 2023", comment: "Everything was included as described." }
    ]
  },
  { 
    id: 3, 
    name: "JBL GO 3 Waterproof", 
    category: "Music", 
    price: 650, 
    rating: 5.0, 
    reviews: 42, 
    image: "https://www.cnet.com/a/img/resize/31f60ac436d81066c75fec25101da2f92c2244d8/hub/2021/02/08/750aa961-6fac-47e4-852c-e7e05b9fd60f/jbl-go-3-1.jpg?auto=webp&fit=crop&height=362&width=644", 
    owner: "Fahad", 
    ownerId: "OWN-0092",
    location: "Dhaka",
    isAvailable: true,
    availableDate: null,
    reviewsData: [
      { id: 1, user: "Siam", rating: 5, date: "Dec 2023", comment: "Loud and clear for its size!" }
    ]
  },
  { 
    id: 4, 
    name: "DJI Mavic 3 Pro Drone", 
    category: "Electronics", 
    price: 1120, 
    rating: 4.7, 
    reviews: 56, 
    image: "https://droneplacebd.com/wp-content/uploads/2025/10/b1dcd044fde0d2732407e393edfe035d@ultra.jpg", 
    owner: "Khan", 
    ownerId: "OWN-1156",
    location: "Mirpur-11",
    isAvailable: false,
    availableDate: "15-Jan-2026",
    reviewsData: []
  }
];

const CATEGORIES = [
  { name: 'All', icon: '✨' },
  { name: 'Photography', icon: '📷' },
  { name: 'Outdoor', icon: '🏕️' },
  { name: 'Music', icon: '🎸' },
  { name: 'Electronics', icon: '💻' },
];

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGear, setSelectedGear] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [equipment, setEquipment] = useState(MOCK_GEAR);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'available', 'unavailable'

  // Fetch equipment from API
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setCurrentUser(storedUser.name);
    }

    const fetchEquipment = async () => {
      setLoading(true);
      try {
        const response = await apiRequest('/equipment/', {
          method: 'GET'
        });
        if (response.ok) {
          const data = await response.json();
          // Map API data to match GearCard format
          const mappedData = data.map(item => {
            const isPng = item.photo_binary && item.photo_binary.startsWith('iVBOR');
            const mimeType = isPng ? 'image/png' : 'image/jpeg';
            const imageUrl = item.photo_binary 
              ? `data:${mimeType};base64,${item.photo_binary}` 
              : (item.photo_url || "https://via.placeholder.com/300x200?text=No+Image");

            return {
            id: item.equipment_id,
            name: item.name,
            category: item.category,
            price: parseFloat(item.daily_price),
            rating: parseFloat(item.rating_avg) || 0,
            reviews: item.rating_count || 0,
            image: imageUrl,
            owner: item.owner_username,
            ownerId: `OWN-${item.equipment_id}`,
            location: item.pickup_location || "Location not specified",
            status: item.status || 'available',
            booked_till: item.booked_till,
            isAvailable: item.status === 'available',
            availableDate: item.booked_till,
            reviewsData: []
          }});
          setEquipment(mappedData);
        } else {
          // Fallback to mock data if API fails
          setEquipment(MOCK_GEAR);
        }
      } catch (error) {
        console.error('Failed to fetch equipment:', error);
        // Fallback to mock data on error
        setEquipment(MOCK_GEAR);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  // Filtering Logic - Show all equipment except owner's own equipment
  const filteredGear = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    
    // ONLY hide equipment if logged in user is the owner
    const isNotOwner = !currentUser || item.owner !== currentUser;
    
    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'available') {
      matchesStatus = item.isAvailable === true;
    } else if (statusFilter === 'unavailable') {
      matchesStatus = item.isAvailable === false;
    }
    
    return matchesSearch && matchesCategory && isNotOwner && matchesStatus;
  });

  const handleSearch = (e) => {
    e.preventDefault();
  };

  if (selectedGear) {
    return <GearDetails item={selectedGear} onBack={() => setSelectedGear(null)} />;
  }

  return (
    <div className="home-wrapper">
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-sphere"></div>
        </div>

        <div className="hero-content">
          <div className="status-pill">
            <span className="dot"></span>
            Now live in Dhaka
          </div>

          <h1 className="main-title">
            Stop buying<br />
            <span className="title-gradient">Start sharing</span>
          </h1>

          <p className="hero-description">
            The trusted peer-to-peer gear platform in Bangladesh
          </p>

          <div className="search-container">
            <form onSubmit={handleSearch} className="search-box">
              <div className="input-field">
                <div className="input-inner">
                  <svg className="icon-search" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search for cameras, drones, or tools..."
                    className="main-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-search">Search</button>
              </div>
            </form>
          </div>

          <div className="cat-grid">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat.name} 
                className={`cat-btn ${activeCategory === cat.name ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.name)}
              >
                <div className="cat-icon">{cat.icon}</div>
                <span className="cat-label">{cat.name}</span>
              </button>
            ))}
          </div>

          <div className="status-filter-grid" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button 
              className={`status-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '0.5rem 1rem',
                border: statusFilter === 'all' ? '2px solid #ff6b35' : '2px solid #ddd',
                borderRadius: '8px',
                background: statusFilter === 'all' ? '#ff6b35' : 'white',
                color: statusFilter === 'all' ? 'white' : '#333',
                fontWeight: statusFilter === 'all' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              All
            </button>
            <button 
              className={`status-btn ${statusFilter === 'available' ? 'active' : ''}`}
              onClick={() => setStatusFilter('available')}
              style={{
                padding: '0.5rem 1rem',
                border: statusFilter === 'available' ? '2px solid #10b981' : '2px solid #ddd',
                borderRadius: '8px',
                background: statusFilter === 'available' ? '#10b981' : 'white',
                color: statusFilter === 'available' ? 'white' : '#333',
                fontWeight: statusFilter === 'available' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              ✓ Available
            </button>
            <button 
              className={`status-btn ${statusFilter === 'unavailable' ? 'active' : ''}`}
              onClick={() => setStatusFilter('unavailable')}
              style={{
                padding: '0.5rem 1rem',
                border: statusFilter === 'unavailable' ? '2px solid #ef4444' : '2px solid #ddd',
                borderRadius: '8px',
                background: statusFilter === 'unavailable' ? '#ef4444' : 'white',
                color: statusFilter === 'unavailable' ? 'white' : '#333',
                fontWeight: statusFilter === 'unavailable' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              ✕ Not Available
            </button>
          </div>
        </div>
      </section>

      <section className="listings-area">
        <div className="listings-header">
          <div>
            <h2 className="grid-title">
              {activeCategory === 'All' ? 'Trending Equipment' : `${activeCategory} Gear`}
            </h2>
            <p className="grid-subtitle">Check availability and upcoming dates for top gear.</p>
          </div>
          <button className="view-all" onClick={() => setActiveCategory('All')}>
            View all listings →
          </button>
        </div>

        <div className="card-grid">
          {filteredGear.length > 0 ? (
            filteredGear.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedGear(item)} 
                style={{ cursor: 'pointer' }}
              >
                <GearCard item={item} />
              </div>
            ))
          ) : (
            <div className="no-results">
              <h3>No gear found matching your search.</h3>
            </div>
          )}
        </div>
      </section>

      <section className="lender-section">
        <div className="lender-container">
          <div className="lender-grid">
            <div className="image-side">
              <div className="blob-decoration"></div>
              <img src="https://images.unsplash.com/photo-1550291652-6ea9114a47b1?auto=format&fit=crop&q=80&w=800" className="lender-img" alt="Community" />
              <div className="stat-card">
                <p className="stat-amount">45,000TK+</p>
                <p className="stat-label">Avg. Monthly Earner</p>
              </div>
            </div>
            <div className="text-side">
              <span className="section-label">Become a Lender</span>
              <h2 className="section-heading">Turn your idle gear into cash.</h2>
              <p className="section-text">
                Join our verified host community. We provide insurance for every rental so you can share with peace of mind.
              </p>
              <ul className="benefit-list">
                {['Tk. 1,00,000 Damage Insurance', 'Verified renters only', 'Instant Payouts'].map((benefit) => (
                  <li key={benefit} className="benefit-item">
                    <svg className="check-icon" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    {benefit}
                  </li>
                ))}
              </ul>
              <button className="btn-primary">Start sharing now!</button>
            </div>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
};

export default Home;