import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    description: '',
    website: '',
    location: '',
    industry: '',
    size: '11-50'
  });
  const [creatingCompany, setCreatingCompany] = useState(false);

  useEffect(() => {
    fetchEmployerData();
  }, [user]);

  const fetchEmployerData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch companies owned by employer
      const companyRes = await api.get(`/companies?owner=${user._id}`);
      setCompanies(companyRes.data.data);

      // Fetch jobs posted by employer
      const jobsRes = await api.get(`/jobs?postedBy=${user._id}`);
      setJobs(jobsRes.data.data);
    } catch (err) {
      console.error('Error fetching employer dashboard data:', err);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleJobStatus = async (jobId, currentStatus) => {
    const nextStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      await api.put(`/jobs/${jobId}`, { status: nextStatus });
      toast.success(`Job marked as ${nextStatus}`);
      fetchEmployerData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update job status');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to permanently delete this job listing?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      toast.success('Job deleted successfully');
      fetchEmployerData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete job');
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setCreatingCompany(true);
    try {
      const res = await api.post('/companies', companyForm);
      toast.success('Company workspace created!');
      setCompanies([res.data.data]);
      setShowCompanyForm(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create company');
    } finally {
      setCreatingCompany(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in bg-radial-grid" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading employer dashboard...</p>
      </div>
    );
  }

  // If no company registered, require them to build one first
  if (companies.length === 0) {
    return (
      <div className="animate-fade-in bg-radial-grid" style={{ minHeight: '80vh', padding: '5rem 1.5rem' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="card" style={{ padding: '3rem', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1.5rem' }}>🏢</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>Create Company Profile</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              Before listing job openings, you need to register a company profile. This profile will be displayed on your job listings so candidates know who is hiring.
            </p>

            {!showCompanyForm ? (
              <button onClick={() => setShowCompanyForm(true)} className="btn btn-primary" style={{ width: '100%' }}>
                Get Started
              </button>
            ) : (
              <form onSubmit={handleCreateCompany} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="company-name">Company Name</label>
                  <input
                    type="text"
                    id="company-name"
                    required
                    className="input-field"
                    placeholder="e.g. Stripe, Acme Corp"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="company-website">Website URL</label>
                  <input
                    type="url"
                    id="company-website"
                    required
                    className="input-field"
                    placeholder="https://acme.corp"
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="company-industry">Industry</label>
                  <input
                    type="text"
                    id="company-industry"
                    required
                    className="input-field"
                    placeholder="e.g. Software, Finance"
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="company-location">Location / HQ</label>
                  <input
                    type="text"
                    id="company-location"
                    required
                    className="input-field"
                    placeholder="e.g. Remote, San Francisco, CA"
                    value={companyForm.location}
                    onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="company-size">Company Size</label>
                  <select
                    id="company-size"
                    className="input-field"
                    value={companyForm.size}
                    onChange={(e) => setCompanyForm({ ...companyForm, size: e.target.value })}
                  >
                    <option value="1-10">1-10 Employees</option>
                    <option value="11-50">11-50 Employees</option>
                    <option value="51-200">51-200 Employees</option>
                    <option value="201-500">201-500 Employees</option>
                    <option value="500+">500+ Employees</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="company-desc">Description</label>
                  <textarea
                    id="company-desc"
                    required
                    rows="3"
                    className="input-field"
                    placeholder="A brief overview of your business operations..."
                    style={{ resize: 'vertical' }}
                    value={companyForm.description}
                    onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCompanyForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={creatingCompany}>
                    {creatingCompany ? 'Creating...' : 'Create Workspace'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-radial-grid" style={{ minHeight: '80vh', padding: '3rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        
        {/* Welcome & Action Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '3rem'
        }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
              Employer Panel
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Managing recruitment for <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{companies[0]?.name}</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/employer/post-job" className="btn btn-primary">
              Post a New Job
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3.5rem'
        }}>
          <div className="card">
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Job Postings</span>
            <h3 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>{jobs.length}</h3>
          </div>
          <div className="card">
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Active Listings</span>
            <h3 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>
              {jobs.filter(j => j.status === 'open').length}
            </h3>
          </div>
          <div className="card">
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Company Industry</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
              {companies[0]?.industry || 'Software'}
            </h3>
          </div>
        </div>

        {/* Jobs List Section */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Your Posted Openings</h2>
        {jobs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No jobs posted yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Create your first listing to start receiving applications from qualified candidates.</p>
            <Link to="/employer/post-job" className="btn btn-primary">Post a Job</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {jobs.map((job) => (
              <div key={job._id} className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                  
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                    </h3>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.5rem' }}>
                      <span className="badge badge-blue">{job.location || 'Remote'}</span>
                      <span className="badge badge-cyan">{job.type}</span>
                      {job.status === 'open' ? (
                        <span className="badge badge-green">Open</span>
                      ) : (
                        <span className="badge badge-red">Closed</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Link to={`/employer/jobs/${job._id}/applicants`} className="btn btn-secondary" style={{ padding: '0.625rem 1.25rem' }}>
                      View Applicants
                    </Link>
                    <button
                      onClick={() => handleToggleJobStatus(job._id, job.status)}
                      className="btn btn-secondary"
                      style={{ padding: '0.625rem 1.25rem' }}
                    >
                      {job.status === 'open' ? 'Close Listing' : 'Reopen'}
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="btn btn-secondary"
                      style={{ padding: '0.625rem 1.25rem', borderColor: '#fee2e2', color: '#dc2626' }}
                      onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                      onMouseLeave={(e) => e.target.style.background = '#fff'}
                    >
                      Delete
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
