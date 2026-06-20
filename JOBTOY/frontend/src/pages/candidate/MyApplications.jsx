import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedApp, setExpandedApp] = useState(null);

  useEffect(() => {
    api.get('/applications/me')
      .then(res => setApplications(res.data.data))
      .catch(err => console.error('Error fetching applications:', err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'reviewing':
      case 'interviewing':
        return <span className="badge badge-yellow" style={{ padding: '0.4rem 0.8rem' }}>In Review</span>;
      case 'offered':
        return <span className="badge badge-green" style={{ padding: '0.4rem 0.8rem' }}>Offered</span>;
      case 'rejected':
        return <span className="badge badge-red" style={{ padding: '0.4rem 0.8rem' }}>Rejected</span>;
      default:
        return <span className="badge badge-blue" style={{ padding: '0.4rem 0.8rem' }}>Applied</span>;
    }
  };

  return (
    <div className="animate-fade-in bg-radial-grid" style={{ minHeight: '80vh', padding: '3rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '950px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>My Applications</h1>
            <p style={{ color: 'var(--text-muted)' }}>Track all your submitted applications and recruiting processes.</p>
          </div>
          <Link to="/jobs" className="btn btn-primary">
            Find More Jobs
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No applications yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You haven't applied to any job listings yet. Start browsing jobs today!</p>
            <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {applications.map((app) => (
              <div key={app._id} className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                      {app.job ? (
                        <Link to={`/jobs/${app.job._id}`} style={{ color: 'inherit' }}>{app.job.title}</Link>
                      ) : (
                        'Deleted Position'
                      )}
                    </h3>
                    
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.5rem' }}>
                      <span className="badge badge-cyan">{app.job?.company?.name || 'Company'}</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{app.job?.location || 'Remote'}</span>
                      <span className="badge badge-blue">{app.job?.type || 'Full-time'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    {getStatusBadge(app.status)}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Applied: {new Date(app.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Additional Details Toggle */}
                {app.coverLetter && (
                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <button
                      onClick={() => setExpandedApp(expandedApp === app._id ? null : app._id)}
                      style={{
                        background: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      {expandedApp === app._id ? 'Hide Cover Letter ▲' : 'View Cover Letter ▼'}
                    </button>
                    
                    {expandedApp === app._id && (
                      <div style={{
                        marginTop: '1rem',
                        background: '#f8fafc',
                        padding: '1.25rem 1.5rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        color: 'var(--text-muted)',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-line'
                      }}>
                        {app.coverLetter}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
