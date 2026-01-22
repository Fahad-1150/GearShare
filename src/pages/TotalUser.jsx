import React, { useState, useMemo, useEffect } from 'react';
import './TotalUser.css';
import Footer from '../components/Footer';
import UserDetailModal from '../components/UserDetailModal';
import { apiRequest } from '../utils/api';

const TotalUser = ({ userData, onNavigate }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ name: '', id: '', location: '', verified: 'any' });
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/users/');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (filters.name && !u.UserName_PK.toLowerCase().includes(filters.name.trim().toLowerCase())) return false;
      if (filters.id && !u.UserName_PK.toLowerCase().includes(filters.id.trim().toLowerCase())) return false;
      if (filters.location && !u.Location?.toLowerCase().includes(filters.location.trim().toLowerCase())) return false;
      if (filters.verified === 'verified' && !u.VerificationStatus) return false;
      if (filters.verified === 'unverified' && u.VerificationStatus) return false;
      return true;
    });
  }, [filters, users]);

  const onChange = (key) => (e) => setFilters((p) => ({ ...p, [key]: e.target.value }));
  const resetFilters = () => setFilters({ name: '', id: '', location: '', verified: 'any' });

  const handleSaveUser = async (updatedData) => {
    try {
      setUsers(users.map(u => 
        u.UserName_PK === selectedUser.UserName_PK 
          ? { ...u, ...updatedData } 
          : u
      ));
      setSelectedUser(null);
      alert('User updated successfully!');
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  return (
    <div className="full-page">
      {selectedUser && (
        <UserDetailModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)}
          onSave={handleSaveUser}
        />
      )}
      <div className="total-users-page">
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
          {loading ? (
            <div className="table-placeholder">Loading users...</div>
          ) : error ? (
            <div className="table-placeholder">Error: {error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="table-placeholder">No users match the filter criteria.</div>
          ) : (
            filteredUsers.map((u) => (
              <div key={u.UserName_PK} className="user-card">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.UserName_PK}`} alt={u.UserName_PK} className="user-card-avatar" />
                <div className="user-card-body">
                  <div className="user-card-name">{u.UserName_PK}</div>
                  <div className="user-card-email">{u.Email}</div>
                  <div className="user-card-meta">{u.Role} • {u.Location || 'N/A'} {u.VerificationStatus ? '• ✅' : ''}</div>
                </div>
                <div className="user-card-actions">
                  <button className="btn btn-outline" onClick={() => setSelectedUser(u)}>View</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TotalUser;
