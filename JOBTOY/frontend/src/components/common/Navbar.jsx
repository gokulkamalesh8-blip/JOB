import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navStyle = {
  display:        'flex',
  justifyContent: 'space-between',
  alignItems:     'center',
  padding:        '1rem 2rem',
  borderBottom:   '1px solid var(--border)',
  background:     'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(12px)',
  webkitBackdropFilter: 'blur(12px)',
  position:       'sticky',
  top:            0,
  zIndex:         100,
  boxShadow:      'var(--shadow-sm)'
};

const logoStyle = {
  fontWeight: 700,
  fontSize: '1.25rem',
  color: 'var(--primary)',
  letterSpacing: '-0.025em',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
};

const linkStyle = {
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'var(--text-muted)',
  padding: '0.5rem 0.75rem',
  borderRadius: 'var(--radius-sm)',
};

const hoverLinkStyle = {
  ...linkStyle,
  color: 'var(--text-main)',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={navStyle}>
      <Link to="/" style={logoStyle}>
        <span style={{ background: 'var(--primary)', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '1rem' }}>JP</span>
        JobPortal
      </Link>
      
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Link to="/jobs" style={hoverLinkStyle}>Browse Jobs</Link>
        
        <span style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 0.5rem' }}></span>
        
        {!user ? (
          <>
            <Link to="/login" style={linkStyle}>Log in</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
              Sign up
            </Link>
          </>
        ) : (
          <>
            {user.role === 'candidate' && (
              <Link to="/dashboard" style={hoverLinkStyle}>Candidate Panel</Link>
            )}
            {user.role === 'employer' && (
              <Link to="/employer/dashboard" style={hoverLinkStyle}>Employer Panel</Link>
            )}
            {user.role === 'admin' && (
              <Link to="/admin" style={hoverLinkStyle}>Admin Panel</Link>
            )}
            
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', marginLeft: '0.5rem' }}
            >
              Log out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
