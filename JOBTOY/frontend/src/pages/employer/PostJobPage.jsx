import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function PostJobPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'full-time',
    location: '',
    remote: false,
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'INR',
    skills: ''
  });

  useEffect(() => {
    if (user) {
      api.get(`/companies?owner=${user._id}`)
        .then(res => {
          setCompanies(res.data.data);
          if (res.data.data.length === 0) {
            toast.warn('You need to create a company profile first!');
            navigate('/employer/dashboard');
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (companies.length === 0) return;

    setSubmitting(true);
    const skillsArray = formData.skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const payload = {
      company: companies[0]._id,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      location: formData.location || 'Remote',
      remote: formData.remote,
      salary: {
        min: formData.salaryMin ? Number(formData.salaryMin) : undefined,
        max: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        currency: formData.salaryCurrency
      },
      skills: skillsArray
    };

    try {
      await api.post('/jobs', payload);
      toast.success('Job posting created successfully!');
      navigate('/employer/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in bg-radial-grid" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Checking authorization...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-radial-grid" style={{ minHeight: '80vh', padding: '3rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '2rem', textAlign: 'center' }}>
          Post a New Position
        </h1>

        <div className="card" style={{ padding: '3rem', boxShadow: 'var(--shadow-lg)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="job-title">Job Title</label>
              <input
                type="text"
                id="job-title"
                required
                className="input-field"
                placeholder="e.g. Senior React Developer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="job-type">Job Type</label>
              <select
                id="job-type"
                className="input-field"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="full-time">Full-Time</option>
                <option value="part-time">Part-Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="job-location">Location / Office</label>
              <input
                type="text"
                id="job-location"
                className="input-field"
                placeholder="e.g. San Francisco, CA (leave blank if remote)"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="job-remote"
                checked={formData.remote}
                onChange={(e) => setFormData({ ...formData, remote: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="job-remote" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
                This is a fully remote position
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '140px', marginBottom: 0 }}>
                <label className="form-label" htmlFor="job-salary-min">Min Salary / Year</label>
                <input
                  type="number"
                  id="job-salary-min"
                  className="input-field"
                  placeholder="e.g. 800000"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: '140px', marginBottom: 0 }}>
                <label className="form-label" htmlFor="job-salary-max">Max Salary / Year</label>
                <input
                  type="number"
                  id="job-salary-max"
                  className="input-field"
                  placeholder="e.g. 1200000"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ width: '100px', marginBottom: 0 }}>
                <label className="form-label" htmlFor="job-salary-cur">Currency</label>
                <select
                  id="job-salary-cur"
                  className="input-field"
                  value={formData.salaryCurrency}
                  onChange={(e) => setFormData({ ...formData, salaryCurrency: e.target.value })}
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="job-skills">Required Skills (comma separated)</label>
              <input
                type="text"
                id="job-skills"
                required
                className="input-field"
                placeholder="React, TypeScript, CSS, Node.js"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="job-desc">Job Description & Requirements</label>
              <textarea
                id="job-desc"
                required
                rows="6"
                className="input-field"
                placeholder="Outline responsibilities, workspace conditions, and benefits..."
                style={{ resize: 'vertical' }}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/employer/dashboard')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                {submitting ? 'Creating Posting...' : 'Publish Listing'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
