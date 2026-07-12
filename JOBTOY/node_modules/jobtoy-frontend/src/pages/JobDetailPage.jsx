import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function JobDetailPage() {
  const { id }  = useParams();
  const nav     = useNavigate();
  const { user } = useAuth();

  const [job,         setJob]         = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [applying,    setApplying]    = useState(false);
  const [applied,     setApplied]     = useState(false);
  const [showForm,    setShowForm]    = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile,  setResumeFile]  = useState(null);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [relatedJobs, setRelatedJobs] = useState([]);

  useEffect(() => {
    setLoading(true);
    api.get(`/jobs/${id}`).then(res => {
      setJob(res.data.data);
      // Fetch related jobs by category
      const cat = res.data.data?.category;
      if (cat) {
        api.get(`/jobs?category=${encodeURIComponent(cat)}&limit=4`)
          .then(r => setRelatedJobs((r.data.data || []).filter(j => j._id !== id)));
      }
    }).catch(() => nav('/jobs'))
      .finally(() => setLoading(false));

    // Check if already applied
    if (user?.role === 'candidate') {
      api.get('/applications/me').then(res => {
        const apps = res.data.data || [];
        if (apps.some(a => a.job?._id === id || a.job === id)) setApplied(true);
      }).catch(() => {});
    }
  }, [id, user]);

  const handleApply = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!user) {
      nav(`/register?redirect=/jobs/${id}`);
      return;
    }
    if (user.role !== 'candidate') {
      setError('Only candidates can apply for jobs.');
      return;
    }

    setApplying(true);
    try {
      const form = new FormData();
      form.append('jobId', id);
      form.append('coverLetter', coverLetter);
      if (resumeFile) form.append('resume', resumeFile);

      await api.post('/applications', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setApplied(true);
      setShowForm(false);
      setSuccess('🎉 Application submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return (
    <div className="job-detail-loading">
      <div className="detail-skeleton" />
    </div>
  );
  if (!job) return null;

  const salStr = job.salary?.min && job.salary?.max
    ? `₹${(job.salary.min/100000).toFixed(1)}L – ₹${(job.salary.max/100000).toFixed(1)}L per annum`
    : 'Not disclosed';
  const expStr = job.experience?.max === 0 ? 'Fresher / 0–1 year' : `${job.experience?.min||0}–${job.experience?.max||'?'} years`;
  const daysAgo = Math.floor((Date.now() - new Date(job.createdAt)) / 86400000);
  const posted  = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;

  return (
    <div className="job-detail-page">
      <div className="job-detail-container">
        {/* Main Content */}
        <main className="job-detail-main">
          {/* Header Card */}
          <div className="detail-header-card">
            <div className="detail-company-logo">
              {job.company?.logoUrl
                ? <img src={job.company.logoUrl} alt={job.company.name} onError={e => e.target.style.display='none'} />
                : <span className="logo-placeholder large">{job.company?.name?.[0] || 'J'}</span>
              }
            </div>
            <div className="detail-header-info">
              <h1 className="detail-job-title">{job.title}</h1>
              <Link to={`/companies`} className="detail-company-name">{job.company?.name}</Link>
              <div className="detail-meta-row">
                <span className={`job-type-badge ${job.type}`}>{job.type}</span>
                {job.remote && <span className="remote-badge">🏠 Remote</span>}
                <span>📍 {job.location || 'Location TBD'}</span>
                <span>💰 {salStr}</span>
                <span>🎓 {expStr}</span>
                <span>📅 Posted {posted}</span>
                {job.openings > 0 && <span>🎯 {job.openings} opening{job.openings > 1 ? 's' : ''}</span>}
                {job.applicants > 0 && <span>👥 {job.applicants} applicant{job.applicants > 1 ? 's' : ''}</span>}
              </div>
            </div>
          </div>

          {/* Success / Error */}
          {success && <div className="alert-success">{success}</div>}
          {error   && <div className="alert-error">{error}</div>}

          {/* Skills */}
          {job.skills?.length > 0 && (
            <div className="detail-section">
              <h2 className="detail-section-title">Required Skills</h2>
              <div className="skills-list">
                {job.skills.map(s => <span key={s} className="skill-chip">{s}</span>)}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="detail-section">
            <h2 className="detail-section-title">Job Description</h2>
            <div
              className="detail-description"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </div>

          {/* Apply Section */}
          <div className="detail-apply-section">
            {applied ? (
              <div className="applied-badge">✅ You have already applied for this job</div>
            ) : showForm ? (
              <form className="apply-form" onSubmit={handleApply}>
                <h3>Complete Your Application</h3>
                <div className="form-group">
                  <label>Cover Letter (optional)</label>
                  <textarea
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                    placeholder="Tell the employer why you're a great fit..."
                    rows={5}
                    className="form-textarea"
                  />
                </div>
                <div className="form-group">
                  <label>Upload Resume (PDF)</label>
                  {user?.resumeUrl && <p className="resume-hint">💡 We'll use your profile resume if you don't upload one.</p>}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={e => setResumeFile(e.target.files[0])}
                    className="file-input"
                  />
                </div>
                <div className="apply-form-actions">
                  <button type="submit" className="btn-apply" disabled={applying}>
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                  <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="apply-cta">
                {!user && (
                  <p className="apply-guest-note">
                    <Link to={`/register?redirect=/jobs/${id}`}>Create a free account</Link> or{' '}
                    <Link to={`/login?redirect=/jobs/${id}`}>sign in</Link> to apply instantly.
                  </p>
                )}
                <button
                  className="btn-apply-large"
                  onClick={() => user ? setShowForm(true) : nav(`/register?redirect=/jobs/${id}`)}
                >
                  {user ? '⚡ Apply Now' : '🔐 Login to Apply'}
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="job-detail-sidebar">
          {/* Company Info */}
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">About Company</h3>
            <div className="sidebar-company-logo">
              {job.company?.logoUrl
                ? <img src={job.company.logoUrl} alt={job.company.name} onError={e => e.target.style.display='none'} />
                : <span className="logo-placeholder">{job.company?.name?.[0]}</span>
              }
            </div>
            <h4 className="sidebar-company-name">{job.company?.name}</h4>
            {job.company?.industry  && <p className="sidebar-info">🏭 {job.company.industry}</p>}
            {job.company?.size      && <p className="sidebar-info">👥 {job.company.size} employees</p>}
            {job.company?.location  && <p className="sidebar-info">📍 {job.company.location}</p>}
            {job.company?.website   && (
              <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="sidebar-link">
                🌐 Visit Website
              </a>
            )}
            {job.company?.description && (
              <p className="sidebar-company-desc">{job.company.description.slice(0,150)}...</p>
            )}
          </div>

          {/* Job Overview */}
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Job Overview</h3>
            <ul className="overview-list">
              <li><span>Category</span><strong>{job.category || 'Technology'}</strong></li>
              <li><span>Job Type</span><strong>{job.type}</strong></li>
              <li><span>Experience</span><strong>{expStr}</strong></li>
              <li><span>Salary</span><strong>{salStr}</strong></li>
              <li><span>Location</span><strong>{job.location || 'TBD'}</strong></li>
              {job.deadline && <li><span>Deadline</span><strong>{new Date(job.deadline).toLocaleDateString('en-IN')}</strong></li>}
            </ul>
          </div>

          {/* Share */}
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Share this Job</h3>
            <div className="share-buttons">
              <button className="share-btn linkedin" onClick={() => window.open(`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`)}>
                LinkedIn
              </button>
              <button className="share-btn twitter" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('Check out this job: ' + job.title)}`)}>
                Twitter
              </button>
              <button className="share-btn copy" onClick={() => { navigator.clipboard.writeText(window.location.href); }}>
                Copy Link
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Related Jobs */}
      {relatedJobs.length > 0 && (
        <section className="related-jobs-section">
          <h2 className="section-title">Similar <span className="gradient-text">Jobs</span></h2>
          <div className="related-jobs-grid">
            {relatedJobs.map(rj => (
              <div key={rj._id} className="job-card" onClick={() => { nav(`/jobs/${rj._id}`); window.scrollTo(0,0); }}>
                <div className="job-card-header">
                  <div className="company-logo-wrap">
                    {rj.company?.logoUrl
                      ? <img src={rj.company.logoUrl} alt={rj.company.name} onError={e => e.target.style.display='none'} />
                      : <span className="logo-placeholder">{rj.company?.name?.[0]}</span>
                    }
                  </div>
                  <div className="job-card-meta">
                    <h3 className="job-card-title">{rj.title}</h3>
                    <p className="job-card-company">{rj.company?.name}</p>
                  </div>
                </div>
                <div className="job-card-details">
                  <span>📍 {rj.location}</span>
                  <span>💰 {rj.salary?.min ? `₹${(rj.salary.min/100000).toFixed(1)}L` : 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
