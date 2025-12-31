import React, { useState } from 'react';
import GearCard from '../components/GearCard';
import GearDetails from './GearDetails'; 
import './home.css';
import logo from '../images/logo.png';

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

  // Filtering Logic
  const filteredGear = MOCK_GEAR.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
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

      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-logo">
              <div className="logo-box">
                <img src={logo} alt="GearShare" className="logo-icon" style={{ width: '100%', padding: '5px' }} />
              </div>
              <span className="logo-text">GearShare</span>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <span className="group-title">Platform</span>
                <a href="#browse">Browse Gear</a>
                <a href="#how">How it works</a>
              </div>
              <div className="link-group">
                <span className="group-title">Support</span>
                <a href="#help">Help Center</a>
                <a href="#safety">Trust & Safety</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            © 2025 GearShare Inc. 
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;