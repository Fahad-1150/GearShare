import React, { useState } from 'react';
import './UserReports.css';
import Footer from '../components/Footer';

const UserReports = ({ userData, onNavigate }) => {
  const [userReports, setUserReports] = useState([
    { id: 'RPT001', reporter: 'John Doe', reporterEmail: 'john@email.com', type: 'Damage', subject: 'Camera returned with scratched lens', itemId: 'R001', item: 'Canon EOS R5', date: '2026-01-05', status: 'Open', priority: 'High' },
    { id: 'RPT002', reporter: 'Jane Smith', reporterEmail: 'jane@email.com', type: 'Late Return', subject: 'Renter has not returned equipment', itemId: 'R003', item: 'Sony A7 IV', date: '2026-01-04', status: 'In Progress', priority: 'Medium' },
    { id: 'RPT003', reporter: 'Mike Johnson', reporterEmail: 'mike@email.com', type: 'Fraud', subject: 'Suspicious listing with fake images', itemId: null, item: 'N/A', date: '2026-01-03', status: 'Open', priority: 'Critical' },
    { id: 'RPT004', reporter: 'Sarah Wilson', reporterEmail: 'sarah@email.com', type: 'Quality Issue', subject: 'Equipment not as described', itemId: 'R004', item: 'GoPro Hero 12', date: '2026-01-06', status: 'Resolved', priority: 'Low' },
    { id: 'RPT005', reporter: 'Tom Brown', reporterEmail: 'tom@email.com', type: 'Payment', subject: 'Double charged for rental', itemId: 'R005', item: 'Rode Wireless GO II', date: '2026-01-02', status: 'In Progress', priority: 'High' },
    { id: 'RPT006', reporter: 'Emily Davis', reporterEmail: 'emily@email.com', type: 'User Conduct', subject: 'Rude and unprofessional owner', itemId: 'R006', item: 'Zhiyun Crane 3S', date: '2026-01-07', status: 'Open', priority: 'Medium' },
    { id: 'RPT007', reporter: 'Chris Martin', reporterEmail: 'chris@email.com', type: 'Safety', subject: 'Faulty equipment - potential hazard', itemId: null, item: 'N/A', date: '2026-01-08', status: 'Open', priority: 'Critical' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const handleReportStatusChange = (reportId, newStatus) => {
    setUserReports(userReports.map(r => 
      r.id === reportId ? { ...r, status: newStatus } : r
    ));
  };

  const handleViewReportDetails = (report) => {
    alert(`Report Details:\n\nID: ${report.id}\nType: ${report.type}\nSubject: ${report.subject}\nReporter: ${report.reporter}\nEmail: ${report.reporterEmail}\nPriority: ${report.priority}\nStatus: ${report.status}\nDate: ${report.date}\nRelated Item: ${report.item}`);
  };

  const handleContactReporter = (email, reportId) => {
    alert(`Opening email to ${email} regarding report ${reportId}`);
  };

  const handleDeleteReport = (reportId) => {
    if (confirm(`Are you sure you want to delete report ${reportId}?`)) {
      setUserReports(userReports.filter(r => r.id !== reportId));
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Critical': return 'priority-critical';
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Open': return 'status-open';
      case 'In Progress': return 'status-progress';
      case 'Resolved': return 'status-resolved';
      default: return '';
    }
  };

  const filteredReports = userReports.filter(report => {
    const matchesSearch = report.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || report.status.toLowerCase().replace(' ', '-') === filterStatus;
    const matchesPriority = filterPriority === 'all' || report.priority.toLowerCase() === filterPriority;
    const matchesType = filterType === 'all' || report.type.toLowerCase().replace(' ', '-') === filterType;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const criticalCount = userReports.filter(r => r.priority === 'Critical' && r.status !== 'Resolved').length;
  const highCount = userReports.filter(r => r.priority === 'High' && r.status !== 'Resolved').length;
  const openCount = userReports.filter(r => r.status === 'Open').length;
  const inProgressCount = userReports.filter(r => r.status === 'In Progress').length;
  const resolvedCount = userReports.filter(r => r.status === 'Resolved').length;

  return (
    <div className="full-page">
      <div className="user-reports-page">
        <div className="page-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => onNavigate('/admin')}>
              ← Back to Dashboard
            </button>
            <h1>User Reports</h1>
            <p>Review and manage user-submitted reports and issues</p>
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
          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="damage">Damage</option>
            <option value="late-return">Late Return</option>
            <option value="fraud">Fraud</option>
            <option value="payment">Payment</option>
            <option value="quality-issue">Quality Issue</option>
            <option value="safety">Safety</option>
            <option value="user-conduct">User Conduct</option>
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
                <th>Related Item</th>
                <th>Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} className={report.priority === 'Critical' ? 'critical-row' : ''}>
                  <td><span className="report-id">{report.id}</span></td>
                  <td><span className="type-badge">{report.type}</span></td>
                  <td className="subject-cell" title={report.subject}>
                    {report.subject.length > 35 ? report.subject.substring(0, 35) + '...' : report.subject}
                  </td>
                  <td>
                    <div className="user-cell">
                      <span className="user-name">{report.reporter}</span>
                      <span className="user-email">{report.reporterEmail}</span>
                    </div>
                  </td>
                  <td>{report.item}</td>
                  <td>{report.date}</td>
                  <td>
                    <span className={`priority-badge ${getPriorityClass(report.priority)}`}>
                      {report.priority}
                    </span>
                  </td>
                  <td>
                    <select 
                      className={`status-select ${getStatusClass(report.status)}`}
                      value={report.status}
                      onChange={(e) => handleReportStatusChange(report.id, e.target.value)}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view-btn" onClick={() => handleViewReportDetails(report)}>
                        👁️ View
                      </button>
                      <button className="action-btn contact-btn" onClick={() => handleContactReporter(report.reporterEmail, report.id)}>
                        ✉️
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteReport(report.id)}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReports.length === 0 && (
            <div className="no-results">No reports found matching your criteria</div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserReports;
