import React, { useState, useEffect } from 'react';
import './UserReports.css';
import Footer from '../components/Footer';
import { apiRequest } from '../utils/api';

const UserReports = ({ userData, onNavigate }) => {
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/reports/');
      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      setUserReports(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
      setUserReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReportStatusChange = async (reportId, newStatus) => {
    try {
      const response = await apiRequest(`/reports/${reportId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update report');
      setUserReports(userReports.map(r => 
        r.report_id === reportId ? { ...r, status: newStatus } : r
      ));
    } catch (err) {
      console.error('Error updating report:', err);
    }
  };

  const handleViewReportDetails = (report) => {
    alert(`Report Details:\n\nID: ${report.report_id}\nType: ${report.report_type}\nSubject: ${report.subject}\nReporter: ${report.reporter_username}\nPriority: ${report.priority}\nStatus: ${report.status}\nDate: ${new Date(report.created_at).toLocaleDateString()}`);
  };

  const handleDeleteReport = async (reportId) => {
    if (confirm(`Are you sure you want to delete report ${reportId}?`)) {
      try {
        const response = await apiRequest(`/reports/${reportId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete report');
        setUserReports(userReports.filter(r => r.report_id !== reportId));
      } catch (err) {
        console.error('Error deleting report:', err);
      }
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'priority-critical';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'status-open';
      case 'in-progress': return 'status-progress';
      case 'resolved': return 'status-resolved';
      default: return '';
    }
  };

  const filteredReports = userReports.filter(report => {
    const matchesSearch = report.reporter_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         String(report.report_id).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || report.status.toLowerCase() === filterStatus;
    const matchesPriority = filterPriority === 'all' || report.priority.toLowerCase() === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const criticalCount = userReports.filter(r => r.priority?.toLowerCase() === 'critical' && r.status?.toLowerCase() !== 'resolved').length;
  const highCount = userReports.filter(r => r.priority?.toLowerCase() === 'high' && r.status?.toLowerCase() !== 'resolved').length;
  const openCount = userReports.filter(r => r.status?.toLowerCase() === 'open').length;
  const inProgressCount = userReports.filter(r => r.status?.toLowerCase() === 'in-progress').length;
  const resolvedCount = userReports.filter(r => r.status?.toLowerCase() === 'resolved').length;

  return (
    <div className="full-page">
      <div className="user-reports-page">
        <div className="page-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => onNavigate('/admin')}>
              ← Back to Dashboard
            </button>
            <h1>User Reports</h1>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card critical">
            <div className="stat-info">
              <span className="stat-number">{criticalCount}</span>
              <span className="stat-text">Critical</span>
            </div>
          </div>
          <div className="stat-card high">
            <div className="stat-info">
              <span className="stat-number">{highCount}</span>
              <span className="stat-text">High Priority</span>
            </div>
          </div>
          <div className="stat-card open">
            <div className="stat-info">
              <span className="stat-number">{openCount}</span>
              <span className="stat-text">Open</span>
            </div>
          </div>
          <div className="stat-card progress">
            <div className="stat-info">
              <span className="stat-number">{inProgressCount}</span>
              <span className="stat-text">In Progress</span>
            </div>
          </div>
          <div className="stat-card resolved">
            <div className="stat-info">
              <span className="stat-number">{resolvedCount}</span>
              <span className="stat-text">Resolved</span>
            </div>
          </div>
        </div>

        <div className="filters-section">
          <input
            type="text"
            placeholder="Search reports..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            className="filter-select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Type</th>
                <th>Subject</th>
                <th>Reporter</th>
                <th>Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Loading reports...</td></tr>
              ) : error ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: 'red' }}>Error: {error}</td></tr>
              ) : filteredReports.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No reports found</td></tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.report_id} className={report.priority?.toLowerCase() === 'critical' ? 'critical-row' : ''}>
                    <td><span className="report-id">{report.report_id}</span></td>
                    <td><span className="type-badge">{report.report_type}</span></td>
                    <td className="subject-cell" title={report.subject}>
                      {report.subject.length > 35 ? report.subject.substring(0, 35) + '...' : report.subject}
                    </td>
                    <td>
                      <div className="user-cell">
                        <span className="user-name">{report.reporter_username}</span>
                      </div>
                    </td>
                    <td>{new Date(report.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`priority-badge ${getPriorityClass(report.priority)}`}>
                        {report.priority}
                      </span>
                    </td>
                    <td>
                      <select 
                        className={`status-select ${getStatusClass(report.status)}`}
                        value={report.status}
                        onChange={(e) => handleReportStatusChange(report.report_id, e.target.value)}
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn view-btn" onClick={() => handleViewReportDetails(report)}>
                          👁️ View
                        </button>
                        <button className="action-btn delete-btn" onClick={() => handleDeleteReport(report.report_id)}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserReports;
