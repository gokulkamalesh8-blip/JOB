import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    userType: 'job_seeker',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRoleToggle = (role) => {
    setFormData({ ...formData, userType: role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      const { token, data } = res.data;

      login(data.user, token);

      if (data.user.userType === 'employer') {
        navigate('/employer/dashboard');
      } else {
        navigate('/jobs');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-card auth-card-wide glass-panel animate-fade-in">
        <div className="auth-header">
          <span className="auth-kicker">Start strong</span>
          <h2 className="auth-title text-gradient">Create your account</h2>
          <p className="auth-subtitle">Set up your profile and start matching with better opportunities.</p>
        </div>

        {error && <div className="form-alert">{error}</div>}

        <div className="role-toggle" aria-label="Account type">
          <button
            type="button"
            onClick={() => handleRoleToggle('job_seeker')}
            className={formData.userType === 'job_seeker' ? 'active' : ''}
          >
            Candidate
          </button>
          <button
            type="button"
            onClick={() => handleRoleToggle('employer')}
            className={formData.userType === 'employer' ? 'active' : ''}
          >
            Employer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name {formData.userType === 'employer' && '/ Company Name'}</label>
            <input
              type="text"
              id="name"
              className="input-field"
              placeholder={formData.userType === 'employer' ? 'Acme Talent' : 'John Doe'}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="input-field"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="passwordConfirm">Confirm Password</label>
            <input
              type="password"
              id="passwordConfirm"
              className="input-field"
              placeholder="Confirm your password"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
