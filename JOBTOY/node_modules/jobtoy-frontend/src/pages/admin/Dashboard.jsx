import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ users: 0, jobs: 0, applications: 0 });
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data.data);

      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data.data);

      const jobsRes = await api.get('/jobs');
      setJobs(jobsRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load administrator portal data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBanUser = async (userId, userName, currentBannedState) => {
    const actionText = currentBannedState ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${actionText} ${userName}?`)) return;

    try {
      const res = await api.put(`/admin/users/${userId}/ban`);
      toast.success(`User ${userName} is now ${res.data.data.isBanned ? 'banned' : 'active'}`);
      // Refresh user list
      fetchAdminData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update user ban state');
    }
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!window.confirm(`Are you sure you want to delete listing "${jobTitle}"?`)) return;

    try {
      await api.delete(`/admin/jobs/${jobId}`);
      toast.success('Job listing removed successfully');
      fetchAdminData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove job listing');
    }
  };

  // Filters
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredJobs = jobs.filter(j => 
    j.title?.toLowerCase().includes(jobSearch.toLowerCase()) || 
    j.company?.name?.toLowerCase().includes(jobSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="animate-fade-in bg-radial-grid" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading administration console...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-radial-grid" style={{ minHeight: '80vh', padding: '3rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '1050px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="badge badge-red" style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}>Admin Console</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>System Administration</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage users, review jobs, and track system KPIs.</p>
        </div>

        {/* Tab Controls */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--border-hover)',
          paddingBottom: '0.75rem',
          marginBottom: '2.5rem'
        }}>
          {[
            { id: 'overview', label: 'Overview Metrics' },
            { id: 'users', label: 'Manage Users' },
            { id: 'jobs', label: 'Manage Jobs' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.9375rem',
                padding: '0.5rem 1rem',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : 'none',
                transition: 'var(--transition)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            {/* KPI Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3.5rem'
            }}>
              <div className="card">
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Registered Members</span>
                <h3 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>{stats.users}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>Candidates, Employers, Admins</p>
              </div>
              <div className="card">
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Listed Positions</span>
                <h3 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '0.25rem' }}>{stats.jobs}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>Open job vacancies</p>
              </div>
              <div className="card">
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Applications Filed</span>
                <h3 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>{stats.applications}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>Completed applicant bids</p>
              </div>
            </div>

            {/* Quick Stats Summary Card */}
            <div className="card" style={{ padding: '2.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Portal Operations Health</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                All databases are operational. Job search indexation caches were rebuilt recently. No queued latency reports.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span className="badge badge-green" style={{ padding: '0.5rem 1rem' }}>MongoDB: Connected</span>
                <span className="badge badge-cyan" style={{ padding: '0.5rem 1rem' }}>Cloudinary: Active</span>
                <span className="badge badge-blue" style={{ padding: '0.5rem 1rem' }}>SMTP Host: Online</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="animate-fade-in">
            {/* Search filter */}
            <div className="form-group" style={{ maxWidth: '400px', marginBottom: '2rem' }}>
              <input
                type="text"
                placeholder="Search users by name or email..."
                className="input-field"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            {/* Users list */}
            {filteredUsers.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No users match search criteria.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {filteredUsers.map((u) => (
                  <div key={u._id} className="card" style={{ padding: '1.5rem 2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {u.name}
                          {u.isBanned && (
                            <span className="badge badge-red" style={{ fontSize: '0.6875rem' }}>Banned</span>
                          )}
                        </h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{u.email}</p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <span className="badge badge-blue" style={{ fontSize: '0.6875rem' }}>Role: {u.role}</span>
                          <span className="badge badge-cyan" style={{ fontSize: '0.6875rem' }}>Joined: {new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Banning button */}
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleBanUser(u._id, u.name, u.isBanned)}
                          className="btn btn-secondary"
                          style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.8125rem',
                            borderColor: u.isBanned ? 'var(--primary)' : '#fee2e2',
                            color: u.isBanned ? 'var(--primary)' : '#dc2626'
                          }}
                        >
                          {u.isBanned ? 'Lift Ban' : 'Ban User'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="animate-fade-in">
            {/* Search filter */}
            <div className="form-group" style={{ maxWidth: '400px', marginBottom: '2rem' }}>
              <input
                type="text"
                placeholder="Search jobs by title or company..."
                className="input-field"
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
              />
            </div>

            {/* Jobs list */}
            {filteredJobs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No jobs match search criteria.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {filteredJobs.map((j) => (
                  <div key={j._id} className="card" style={{ padding: '1.5rem 2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{j.title}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                          Company: <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{j.company?.name || 'Company'}</span> | Location: {j.location || 'Remote'}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <span className="badge badge-blue">{j.type}</span>
                          {j.salary && (j.salary.min || j.salary.max) && (
                            <span className="badge badge-green">
                              {j.salary.min ? `${(j.salary.min / 100000).toFixed(1)}L` : ''} - {j.salary.max ? `${(j.salary.max / 100000).toFixed(1)}L` : ''} {j.salary.currency || 'INR'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Deleting button */}
                      <button
                        onClick={() => handleDeleteJob(j._id, j.title)}
                        className="btn btn-secondary"
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.8125rem',
                          borderColor: '#fee2e2',
                          color: '#dc2626'
                        }}
                      >
                        Remove Listing
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
