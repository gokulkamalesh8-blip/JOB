import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: '#0f172a',
      color: '#94a3b8',
      borderTop: '1px solid #1e293b',
      padding: '5rem 1.5rem 2.5rem',
      fontSize: '0.875rem'
    }}>
      <div className="container" style={{ padding: 0 }}>
        {/* Main Footer Links */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '3rem',
          marginBottom: '4rem'
        }}>
          {/* Brand Info Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Link to="/" style={{
              fontWeight: 700,
              fontSize: '1.25rem',
              color: '#fff',
              letterSpacing: '-0.025em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                background: 'var(--primary)',
                color: '#fff',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                fontSize: '1rem'
              }}>JP</span>
              JobPortal
            </Link>
            <p style={{ lineHeight: 1.6, color: '#94a3b8' }}>
              Connect with leading employers and discover career opportunities tailored to your unique skillset.
            </p>
            {/* Social Links */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              {['Twitter', 'LinkedIn', 'GitHub', 'Facebook'].map((social, idx) => (
                <a
                  key={idx}
                  href="#"
                  style={{
                    color: '#64748b',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#fff'}
                  onMouseLeave={(e) => e.target.style.color = '#64748b'}
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Candidates Column */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '1.25rem', fontSize: '0.9375rem' }}>For Candidates</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><Link to="/jobs" onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>Browse Jobs</Link></li>
              <li><Link to="/dashboard" onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>Candidate Panel</Link></li>
              <li><Link to="/my-applications" onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>My Applications</Link></li>
              <li><Link to="/profile" onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>Manage Resume</Link></li>
            </ul>
          </div>

          {/* Employers Column */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '1.25rem', fontSize: '0.9375rem' }}>For Employers</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><Link to="/employer/post-job" onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>Post a Job</Link></li>
              <li><Link to="/employer/dashboard" onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>Employer Dashboard</Link></li>
              <li><a href="#" onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>Recruiting Resources</a></li>
              <li><a href="#" onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>Talent Solutions</a></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '1.25rem', fontSize: '0.9375rem' }}>Company</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><a href="#" onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>About Us</a></li>
              <li><a href="#" onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>Our Blog</a></li>
              <li><a href="#" onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>Contact Support</a></li>
              <li><a href="#" onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>Privacy & Terms</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#1e293b', marginBottom: '2rem' }}></div>

        {/* Bottom Copyright */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          color: '#64748b',
          fontSize: '0.8125rem'
        }}>
          <p>© {new Date().getFullYear()} JobPortal. All rights reserved.</p>
          <p>
            Designed & Built with <span style={{ color: 'var(--primary)' }}>♥</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
