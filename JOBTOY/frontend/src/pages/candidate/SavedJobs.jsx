import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const formatSalary = (salary) => {
  if (!salary?.min || !salary?.max) return 'Salary not disclosed';
  return `INR ${(salary.min / 100000).toFixed(1)}L - INR ${(salary.max / 100000).toFixed(1)}L`;
};

export default function SavedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/jobs/saved')
      .then(res => setJobs(res.data.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const removeSavedJob = async (jobId) => {
    const previousJobs = jobs;
    setJobs(current => current.filter(job => job._id !== jobId));
    try {
      await api.delete(`/jobs/${jobId}/save`);
    } catch {
      setJobs(previousJobs);
    }
  };

  return (
    <div className="saved-jobs-page">
      <div className="saved-jobs-header">
        <div>
          <span className="page-kicker">Candidate workspace</span>
          <h1>Saved Jobs</h1>
          <p>Keep track of roles you want to revisit before applying.</p>
        </div>
        <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
      </div>

      {loading ? (
        <div className="results-loading">
          {[...Array(4)].map((_, index) => <div key={index} className="job-card-skeleton" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">0</div>
          <h3>No saved jobs yet</h3>
          <p>Save roles from the job list and they will appear here.</p>
          <Link to="/jobs" className="btn btn-primary">Find Jobs</Link>
        </div>
      ) : (
        <div className="results-list">
          {jobs.map(job => (
            <div key={job._id} className="job-card saved-job-card" onClick={() => navigate(`/jobs/${job._id}`)} role="button" tabIndex={0}>
              <div className="job-card-header">
                <div className="company-logo-wrap">
                  {job.company?.logoUrl
                    ? <img src={job.company.logoUrl} alt={job.company?.name} onError={e => { e.currentTarget.style.display = 'none'; }} />
                    : <span className="logo-placeholder">{job.company?.name?.[0] || 'J'}</span>}
                </div>
                <div className="job-card-meta">
                  <h3 className="job-card-title">{job.title}</h3>
                  <p className="job-card-company">{job.company?.name || 'Company'}</p>
                </div>
                <button
                  type="button"
                  className="save-job-btn saved"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeSavedJob(job._id);
                  }}
                >
                  Saved
                </button>
              </div>
              <div className="job-card-details">
                <span><b>Location</b> {job.location || 'Location TBD'}</span>
                <span><b>Salary</b> {formatSalary(job.salary)}</span>
                <span><b>Experience</b> {job.experience?.min || 0}-{job.experience?.max || '?'} yrs</span>
              </div>
              <div className="job-card-footer">
                <div className="job-skills">
                  {job.skills?.slice(0, 3).map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
                </div>
                <span className="job-posted">Saved {new Date(job.savedAt || job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
