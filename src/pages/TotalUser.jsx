import React, { useState, useMemo } from 'react';
import './TotalUser.css';
import Footer from '../components/Footer';

const mockUsers = [
  { id: 1, name: 'Alice Khan', email: 'alice@gearshare.com', role: 'User', location: 'Dhaka, Bangladesh', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', verified: true },
  { id: 2, name: 'Bapon Das', email: 'bapon@gearshare.com', role: 'User', location: 'Feni, Bangladesh', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bapon', verified: false },
  { id: 3, name: 'System Admin', email: 'admin@gmail.com', role: 'Admin', location: 'HQ', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', verified: true },
  { id: 4, name: 'System Admin', email: 'admin@gmail.com', role: 'Admin', location: 'HQ', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', verified: false },
];



const TotalUser = ({ userData, onNavigate }) => {
  const [filters, setFilters] = useState({ name: '', id: '', location: '', verified: 'any' });

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((u) => {
      if (filters.name && !u.name.toLowerCase().includes(filters.name.trim().toLowerCase())) return false;
      if (filters.id && !String(u.id).includes(String(filters.id).trim())) return false;
      if (filters.location && !u.location.toLowerCase().includes(filters.location.trim().toLowerCase())) return false;
      if (filters.verified === 'verified' && !u.verified) return false;
      if (filters.verified === 'unverified' && u.verified) return false;
      return true;
    });
  }, [filters]);

  const onChange = (key) => (e) => setFilters((p) => ({ ...p, [key]: e.target.value }));
  const resetFilters = () => setFilters({ name: '', id: '', location: '', verified: 'any' });

  return (
   <div className="full-page" >





    <div className="total-users-page" >
      <div className="page-header">
        <h2>All Users</h2>
        <p className="muted">Manage platform users — view, search, or inspect profiles.</p>
      </div>

        <div className="filter-bar">
          <input className="filter-input" placeholder="Name" value={filters.name} onChange={onChange('name')} />
          <input className="filter-input" placeholder="User ID" value={filters.id} onChange={onChange('id')} />
          <input className="filter-input" placeholder="Location" value={filters.location} onChange={onChange('location')} />
          <select className="filter-select" value={filters.verified} onChange={onChange('verified')}>
            <option value="any">Any</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
          <div className="filter-actions">
            <button className="btn btn-outline" onClick={resetFilters}>Reset</button>
          </div>
        </div>

      <div className="users-grid">
        {filteredUsers.length === 0 ? (
          <div className="table-placeholder">No users match the filter criteria.</div>
        ) : (
          filteredUsers.map((u) => (
            <div key={u.id} className="user-card">
              <img src={u.avatar} alt={u.name} className="user-card-avatar" />
              <div className="user-card-body">
                <div className="user-card-name">{u.name}</div>
                <div className="user-card-email">{u.email}</div>
                <div className="user-card-meta">{u.role} • {u.location} {u.verified ? '• ✅' : ''}</div>
              </div>
              <div className="user-card-actions">
                <button className="btn btn-outline" onClick={() => onNavigate(`/admin/users/${u.id}`)}>View</button>
              </div>
            </div>
          ))
        )}
      </div>

      
    </div>
    <Footer/>
    </div>
    
  );
};

export default TotalUser;
