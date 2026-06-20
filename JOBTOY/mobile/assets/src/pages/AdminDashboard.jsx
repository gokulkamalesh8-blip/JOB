import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { Card, Button, Loader } from '../components';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, appRes] = await Promise.all([
        axios.get('/api/admin/stats', config),
        axios.get('/api/admin/users', config),
        axios.get('/api/admin/applications', config),
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setApplications(appRes.data.applications);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🎮 JOBTOY Admin Dashboard</h1>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="admin-content">
          <div className="stats-grid">
            <Card className="stat-card">
              <div className="stat-number">{stats?.totalUsers || 0}</div>
              <div className="stat-name">Total Users</div>
            </Card>
            <Card className="stat-card">
              <div className="stat-number">{stats?.totalJobs || 0}</div>
              <div className="stat-name">Total Jobs</div>
            </Card>
            <Card className="stat-card">
              <div className="stat-number">{stats?.totalCompanies || 0}</div>
              <div className="stat-name">Total Companies</div>
            </Card>
            <Card className="stat-card">
              <div className="stat-number">{stats?.totalApplications || 0}</div>
              <div className="stat-name">Total Applications</div>
            </Card>
            <Card className="stat-card">
              <div className="stat-number">{stats?.jobsPostedToday || 0}</div>
              <div className="stat-name">Jobs Posted Today</div>
            </Card>
            <Card className="stat-card">
              <div className="stat-number">{stats?.applicationsToday || 0}</div>
              <div className="stat-name">Applications Today</div>
            </Card>
          </div>

          {/* Application Status Chart */}
          <Card className="chart-card">
            <h3>Application Status Distribution</h3>
            <div className="status-chart">
              {Object.entries(stats?.applicationsByStatus || {}).map(
                ([status, count]) => (
                  <div key={status} className="chart-item">
                    <span>{status}</span>
                    <div className="chart-bar">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${(count / stats.totalApplications) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span>{count}</span>
                  </div>
                )
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-content">
          <Card>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.userType}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.isVerified ? 'verified' : 'pending'
                        }`}
                      >
                        {user.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="admin-content">
          <Card>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Applied</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td>{app.candidateId.name}</td>
                    <td>{app.jobId.title}</td>
                    <td>{app.companyId.name}</td>
                    <td>
                      <span className={`badge ${app.status.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      {new Date(app.appliedDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}