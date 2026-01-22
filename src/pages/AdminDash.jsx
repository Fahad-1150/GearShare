import React, { useState, useEffect } from 'react';
import './AdminDash.css';
import Footer from '../components/Footer';
import { apiRequest } from '../utils/api';
import EquipmentDetailModal from '../components/EquipmentDetailModal';

const AdminDash = ({ userData, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [reportType, setReportType] = useState('rental');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [generatingReport, setGeneratingReport] = useState(false);
  const [stats, setStats] = useState([
    { label: 'Total Users', value: 0, path: '/admin/users' },
    { label: 'Total Listings', value: 0, path: '/admin/listings' },
    { label: 'Active Rentals', value: 0, path: '/admin/rentals' },
    { label: 'Reports', value: 0, path: '/admin/reports' },
  ]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [allEquipment, setAllEquipment] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [usersRes, equipmentRes, reservationsRes, reportsRes] = await Promise.all([
        apiRequest('/users/'),
        apiRequest('/equipment/'),
        apiRequest('/reservation/'),
        apiRequest('/reports/')
      ]);

      const usersData = usersRes.ok ? await usersRes.json() : [];
      const equipmentData = equipmentRes.ok ? await equipmentRes.json() : [];
      const reservationsData = reservationsRes.ok ? await reservationsRes.json() : [];
      const reportsData = reportsRes.ok ? await reportsRes.json() : [];

      // Map equipment with image URLs from photo_binary
      const mappedEquipment = equipmentData.map(item => {
        const isPng = item.photo_binary && item.photo_binary.startsWith('iVBOR');
        const mimeType = isPng ? 'image/png' : 'image/jpeg';
        const imageUrl = item.photo_binary 
          ? `data:${mimeType};base64,${item.photo_binary}` 
          : (item.photo_url || "https://via.placeholder.com/300x200?text=No+Image");
        return { ...item, image: imageUrl };
      });
      setAllEquipment(mappedEquipment);

      // Filter for active rentals
      const activeRentals = reservationsData.filter(r => r.status === 'active' || r.status === 'pending');

      setStats([
        { label: 'Total Users', value: usersData.length, path: '/admin/users' },
        { label: 'Total Listings', value: equipmentData.length, path: '/admin/listings' },
        { label: 'Active Rentals', value: activeRentals.length, path: '/admin/rentals' },
        { label: 'Reports', value: reportsData.length, path: '/admin/reports' },
      ]);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sample rental history data
  const rentalHistory = [
    { id: 'R001', user: 'John Doe', item: 'Canon EOS R5', startDate: '2026-01-01', endDate: '2026-01-05', status: 'Completed', amount: '$150' },
    { id: 'R002', user: 'Jane Smith', item: 'DJI Mavic 3', startDate: '2026-01-03', endDate: '2026-01-07', status: 'Active', amount: '$200' },
    { id: 'R003', user: 'Mike Johnson', item: 'Sony A7 IV', startDate: '2026-01-02', endDate: '2026-01-04', status: 'Completed', amount: '$120' },
    { id: 'R004', user: 'Sarah Wilson', item: 'GoPro Hero 12', startDate: '2026-01-05', endDate: '2026-01-08', status: 'Active', amount: '$80' },
    { id: 'R005', user: 'Tom Brown', item: 'Rode Wireless GO II', startDate: '2025-12-28', endDate: '2026-01-02', status: 'Completed', amount: '$50' },
    { id: 'R006', user: 'Emily Davis', item: 'Zhiyun Crane 3S', startDate: '2026-01-06', endDate: '2026-01-10', status: 'Pending', amount: '$90' },
  ];

  const handleStatClick = (path) => {
    onNavigate(path);
  };

  const handleGenerateReport = () => {
    setGeneratingReport(true);
    // Simulate report generation
    setTimeout(() => {
      setGeneratingReport(false);
      alert(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully!`);
    }, 1500);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'status-completed';
      case 'Active': return 'status-active';
      case 'Pending': return 'status-pending';
      default: return '';
    }
  };

  const handleEquipmentClick = (itemName) => {
    const equipment = allEquipment.find(e => e.name === itemName);
    if (equipment) {
      setSelectedEquipment(equipment);
    }
  };

  const handleSaveEquipment = async (updatedData) => {
    try {
      const formData = new FormData();
      formData.append('name', updatedData.name);
      formData.append('category', updatedData.category);
      formData.append('daily_price', updatedData.daily_price);
      formData.append('pickup_location', updatedData.pickup_location);
      formData.append('photo_url', updatedData.photo_url);
      formData.append('status', updatedData.status);

      const response = await apiRequest(`/equipment/${selectedEquipment.equipment_id}`, {
        method: 'PUT',
        headers: { 'owner_username': selectedEquipment.owner_username },
        body: formData
      });

      if (response.ok) {
        setAllEquipment(allEquipment.map(eq =>
          eq.equipment_id === selectedEquipment.equipment_id
            ? { ...eq, ...updatedData }
            : eq
        ));
        setSelectedEquipment(null);
        alert('Equipment updated successfully!');
      } else {
        alert('Failed to update equipment');
      }
    } catch (err) {
      console.error('Error updating equipment:', err);
      alert('Failed to update equipment');
    }
  };

  return (
   <div className="full-page">
   {selectedEquipment && (
     <EquipmentDetailModal
       equipment={selectedEquipment}
       onClose={() => setSelectedEquipment(null)}
       onSave={handleSaveEquipment}
     />
   )}
   <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p style={{ marginTop: 4 }}>Welcome, {userData?.name || 'Admin'}</p>
      </div>

      <div className="admin-stats">
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px' }}>Loading stats...</div>
        ) : (
          stats.map((s) => (
            <div
              key={s.label}
              className="admin-stat clickable"
              onClick={() => handleStatClick(s.path)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleStatClick(s.path); }}
            >
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))
        )}
      </div>

      <div className="rental-history">
        <h2 style={{marginBottom: '15px'}}>Recent Rental Activity</h2>
        <table className="rental-table">
          <thead>
            <tr>
              <th>Rental ID</th>
              <th>User</th>
              <th>Equipment</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {rentalHistory.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.user}</td>
                <td 
                  onClick={() => handleEquipmentClick(r.item)} 
                  style={{cursor: 'pointer', color: '#0066cc', textDecoration: 'underline'}}
                >
                  {r.item}
                </td>
                <td>{r.startDate}</td>
                <td>{r.endDate}</td>
                <td><span className={`status-badge ${getStatusClass(r.status)}`}>{r.status}</span></td>
                <td>{r.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tab Content */}
      
     
    </div>

  <Footer/>
   </div>
  );
};

export default AdminDash;
