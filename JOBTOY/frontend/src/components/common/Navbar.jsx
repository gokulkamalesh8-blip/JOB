import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`;

  return (
    <nav className="site-navbar">
      <Link to="/" className="navbar-logo" aria-label="JobPortal home">
        <span className="navbar-logo-mark">JP</span>
        <span>JobPortal</span>
      </Link>

      <div className="navbar-links">
        <NavLink to="/jobs" className={linkClass}>Browse Jobs</NavLink>

        {!user ? (
          <>
            <NavLink to="/employer/post-job" className={linkClass}>Post a Job</NavLink>
            <NavLink to="/login" className={linkClass}>Log in</NavLink>
            <Link to="/register" className="btn btn-primary nav-cta">Sign up</Link>
          </>
        ) : (
          <>
            {user.userType === 'job_seeker' && (
              <>
                <NavLink to="/my-applications" className={linkClass}>Applications</NavLink>
                <NavLink to="/saved-jobs" className={linkClass}>Saved Jobs</NavLink>
                <NavLink to="/profile" className={linkClass}>Profile</NavLink>
                <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
              </>
            )}
            {user.userType === 'employer' && (
              <>
                <NavLink to="/employer/post-job" className={linkClass}>Post a Job</NavLink>
                <NavLink to="/employer/dashboard" className={linkClass}>Employer Dashboard</NavLink>
              </>
            )}
            {user.userType === 'admin' && (
              <>
                <NavLink to="/employer/post-job" className={linkClass}>Post a Job</NavLink>
                <NavLink to="/admin" className={linkClass}>Admin Panel</NavLink>
              </>
            )}

            <button onClick={handleLogout} className="btn btn-secondary nav-cta">
              Log out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
