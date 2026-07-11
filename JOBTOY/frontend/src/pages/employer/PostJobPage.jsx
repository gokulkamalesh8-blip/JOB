import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function PostJobPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    jobType: 'Full-time',
    minSalary: '',
    maxSalary: '',
    skills: '' // Will split by comma
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        jobType: formData.jobType,
        salary: {
          min: Number(formData.minSalary),
          max: Number(formData.maxSalary)
        },
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      };

      const res = await api.post('/jobs', payload);
      
      // Redirect to the newly created job page
      navigate(`/jobs/${res.data.job._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '800px', marginTop: '3rem' }}>
      <div className="card" style={{ padding: '3rem' }}>
        <h2 style={{ marginBottom: '0.5rem', fontWeight: 800, fontSize: '2rem' }} className="text-gradient">Post a New Job</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '2.5rem', fontWeight: 500 }}>
          Find the perfect candidate for your open role.
        </p>

        {error && (
          <div style={{
            background: 'rgba(254, 226, 226, 0.9)',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
            fontWeight: 600,
            borderLeft: '4px solid #ef4444'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Job Title</label>
            <input
              type="text"
              id="title"
              className="input-field"
              placeholder="e.g. Senior Frontend Developer"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              className="input-field"
              placeholder="e.g. Remote, San Francisco, CA"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid-responsive" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="minSalary">Min Salary (INR)</label>
              <input
                type="number"
                id="minSalary"
                className="input-field"
                placeholder="e.g. 500000"
                value={formData.minSalary}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="maxSalary">Max Salary (INR)</label>
              <input
                type="number"
                id="maxSalary"
                className="input-field"
                placeholder="e.g. 1000000"
                value={formData.maxSalary}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="jobType">Job Type</label>
            <select 
              id="jobType" 
              className="input-field"
              value={formData.jobType}
              onChange={handleChange}
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="skills">Required Skills (Comma separated)</label>
            <input
              type="text"
              id="skills"
              className="input-field"
              placeholder="e.g. React, Node.js, TypeScript"
              value={formData.skills}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Job Description</label>
            <textarea
              id="description"
              className="input-field"
              rows="6"
              placeholder="Describe the responsibilities, requirements, and perks..."
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              marginTop: '1.5rem', 
              padding: '0.875rem', 
              fontSize: '1rem',
              borderRadius: 'var(--radius-md)'
            }}
            disabled={loading}
          >
            {loading ? 'Posting Job...' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
}
