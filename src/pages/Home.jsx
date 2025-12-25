import React, { useState } from 'react';
import GearCard from '../components/GearCard';
import './home.css';
import logo from '../images/logo.png';
import Signup from './Signup';
const MOCK_GEAR = [
  { id: 1, name: "Sony A7 IV Mirrorless Camera", category: "Photography", price: 2000, rating: 4.9, reviews: 124, image: "https://4.img-dpreview.com/files/p/E~TS1180x0~articles/9494401150/Product-Images/Sony_alpha_7IV_beauty.jpeg", owner: "Nazmul", location: "Feni" },
  { id: 2, name: "Gopro 5", category: "Outdoor Photography", price: 450, rating: 4.8, reviews: 89, image: "https://media.dcrainmaker.com/images/2016/10/GoPro-Hero5-Black-Front-Shot_thumb.jpg", owner: "Haque", location: "Comilla" },
  { id: 3, name: "JBL GO 3", category: "Music", price: 650, rating: 5.0, reviews: 42, image: "https://www.cnet.com/a/img/resize/31f60ac436d81066c75fec25101da2f92c2244d8/hub/2021/02/08/750aa961-6fac-47e4-852c-e7e05b9fd60f/jbl-go-3-1.jpg?auto=webp&fit=crop&height=362&width=644", owner: "Fahad", location: "Dhaka" },
  { id: 4, name: "DJI Mavic 3 Pro Drone", category: "Electronics", price: 1120, rating: 4.7, reviews: 56, image: "https://droneplacebd.com/wp-content/uploads/2025/10/b1dcd044fde0d2732407e393edfe035d@ultra.jpg", owner: "Khan.", location: "Mirpur-11" }
];

const CATEGORIES = [
  { name: 'Photography', icon: '📷' },
  { name: 'Outdoor', icon: '🏕️' },
  { name: 'Music', icon: '🎸' },
  { name: 'Electronics', icon: '💻' },
  { name: 'Tools', icon: '🔨' },
];

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="home-wrapper">
      {/* Hero Section */}
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
            -Stop buying-<br />
            <span className="title-gradient">Start sharing</span>
          </h1>

          <p className="hero-description">
            --The  trusted peer-to-peer gear Platfrom--
          </p>

          <div className="search-container">
            <form onSubmit={handleSearch} className="search-box">
              <div className="glow-effect"></div>
              <div className="input-field">
                <div className="input-inner">
                  <svg className="icon-search" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search for gear..."
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
              <button key={cat.name} className="cat-btn">
                <div className="cat-icon">{cat.icon}</div>
                <span className="cat-label">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="listings-area">
        <div className="listings-header">
          <div>
            <h2 className="grid-title">Trending Equipment</h2>
            <p className="grid-subtitle">Most rented items in your area this week.</p>
          </div>
          <button className="view-all">View all listings &rarr;</button>
        </div>

        <div className="card-grid">
          {MOCK_GEAR.map((item) => (
            <GearCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Feature Section */}
      <section className="lender-section">
        <div className="lender-container">
          <div className="lender-grid">
            <div className="image-side">
              <div className="blob-decoration"></div>
              <img src="https://images.unsplash.com/photo-1550291652-6ea9114a47b1?auto=format&fit=crop&q=80&w=800" className="lender-img" alt="Community" />
              <div className="stat-card">
                <p className="stat-amount">45,000TK+</p>
                <p className="stat-label">Average Monthly Earner</p>
              </div>
            </div>
            <div className="text-side">
              <span className="section-label">Become a Lender</span>
              <h2 className="section-heading">Turn your idle gear into cash.</h2>
              <p className="section-text">
                Have a camera gathering dust? Join our verified host community and start earning today. We provide full insurance for every rental.
              </p>
              <ul className="benefit-list">
                {['10,000,00 Damage Insurance included', 'Verified renters only', 'Payouts within 24 hours'].map((item) => (
                  <li key={item} className="benefit-item">
                    <svg className="check-icon" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                className="btn-primary"
                onClick={() => <Signup onNavigate={navigateTo} />}
              >
                Start sharing now!
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-logo">
              <div className="logo-box">
                <img src={logo} alt="GearShare" className="logo-icon" />

              </div>
              <span className="logo-text">GearShare</span>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <span className="group-title">Platform</span>
                <a href="#">Browse Gear</a>
                <a href="#">How it works</a>
              </div>
              <div className="link-group">
                <span className="group-title">Support</span>
                <a href="#">Help Center</a>
                <a href="#">Trust & Safety</a>
              </div>
              <div className="link-group">
                <span className="group-title">Legal</span>
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; 2025 GearShare Inc. | SMUCT
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;