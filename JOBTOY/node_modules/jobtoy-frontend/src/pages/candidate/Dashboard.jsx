import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, reviewing: 0, offered: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/applications/me')
      .then(res => {
        const apps = res.data.data;
        const s = { total: apps.length, reviewing: 0, offered: 0, rejected: 0 };
        apps.forEach(app => {
          if (app.status === 'reviewing' || app.status === 'interviewing') s.reviewing++;
          else if (app.status === 'offered') s.offered++;
          else if (app.status === 'rejected') s.rejected++;
        });
        setStats(s);
      })
      .catch(err => console.error('Error fetching applications for stats:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in bg-radial-grid" style={{ minHeight: '80vh', padding: '3rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Welcome Section */}
        <div className="card animate-fade-in" style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, #1e1b4b 100%)',
          color: '#fff',
          padding: '3rem 2.5rem',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
            Welcome back, {user?.name || 'Candidate'}!
          </h1>
          <p style={{ color: '#c7d2fe', fontSize: '1.0625rem', maxWidth: '600px', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            Monitor your submitted applications, update your professional resume details, or search for newly listed opportunities.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/jobs" className="btn btn-primary" style={{ background: '#fff', color: 'var(--primary)', boxShadow: 'none' }}>
              Explore Jobs
            </Link>
            <Link to="/profile" className="btn btn-secondary" style={{ background: 'transparent', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#fff' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
              Manage Profile
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Application Overview</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>Loading stats...</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            {[
              { label: 'Total Applications', value: stats.total, color: 'var(--primary)' },
              { label: 'In Review / Interview', value: stats.reviewing, color: 'var(--secondary)' },
              { label: 'Offers Received', value: stats.offered, color: '#059669' },
              { label: 'Unsuccessful', value: stats.rejected, color: '#dc2626' }
            ].map((stat, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>{stat.label}</span>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Quick Tips Card */}
        <div className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', padding: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(79, 70, 229, 0.08)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1.25rem',
            flexShrink: 0
          }}>
            💡
          </div>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <h4 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>Keep your profile complete</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Recruiters prioritize candidates who have listed skills and uploaded a recent PDF resume. Head over to profile settings to complete your workspace details.
            </p>
          </div>
          <Link to="/profile" className="btn btn-secondary" style={{ padding: '0.625rem 1.25rem' }}>
            Edit Profile
          </Link>
        </div>

      </div>
    </div>
  );
}
