import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const LOCATIONS = ['Bangalore', 'Mumbai', 'Hyderabad', 'Chennai', 'Pune', 'Noida', 'Gurugram', 'Delhi', 'Kolkata', 'Remote'];
const CATEGORIES = ['Technology', 'Data & Analytics', 'Product', 'Design', 'Marketing', 'Sales', 'Finance', 'Human Resources', 'Operations'];
const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship'];
const SALARY_OPTIONS = [
  { label: 'Any', min: '', max: '' },
  { label: '0 - 3 LPA', min: '0', max: '300000' },
  { label: '3 - 6 LPA', min: '300000', max: '600000' },
  { label: '6 - 10 LPA', min: '600000', max: '1000000' },
  { label: '10 - 20 LPA', min: '1000000', max: '2000000' },
  { label: '20 LPA+', min: '2000000', max: '' },
];
const EXP_OPTIONS = [
  { label: 'Any Experience', min: '', max: '' },
  { label: 'Fresher (0-1)', min: '0', max: '1' },
  { label: '1-3 Years', min: '1', max: '3' },
  { label: '3-5 Years', min: '3', max: '5' },
  { label: '5-10 Years', min: '5', max: '10' },
  { label: '10+ Years', min: '10', max: '' },
];

function JobCard({ job, isSaved, onToggleSave }) {
  const nav = useNavigate();
  const salStr = job.salary?.min && job.salary?.max
    ? `INR ${(job.salary.min / 100000).toFixed(1)}L - INR ${(job.salary.max / 100000).toFixed(1)}L`
    : 'Not disclosed';
  const expStr = job.experience?.max === 0 ? 'Fresher' : `${job.experience?.min || 0}-${job.experience?.max || '?'} yrs`;
  const daysAgo = Math.floor((Date.now() - new Date(job.createdAt)) / 86400000);
  const posted = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;

  return (
    <div className="job-card" onClick={() => nav(`/jobs/${job._id}`)} role="button" tabIndex={0}>
      <div className="job-card-header">
        <div className="company-logo-wrap">
          {job.company?.logoUrl
            ? <img src={job.company.logoUrl} alt={job.company.name} onError={e => { e.currentTarget.style.display = 'none'; }} />
            : <span className="logo-placeholder">{job.company?.name?.[0] || 'J'}</span>}
        </div>
        <div className="job-card-meta">
          <h3 className="job-card-title">{job.title}</h3>
          <p className="job-card-company">{job.company?.name || 'Company'}</p>
        </div>
        <div className="job-card-actions">
          <span className={`job-type-badge ${job.type}`}>{job.type}</span>
          <button
            type="button"
            className={`save-job-btn ${isSaved ? 'saved' : ''}`}
            onClick={(event) => {
              event.stopPropagation();
              onToggleSave(job._id);
            }}
          >
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
      <div className="job-card-details">
        <span><b>Location</b> {job.location || 'TBD'}</span>
        <span><b>Salary</b> {salStr}</span>
        <span><b>Experience</b> {expStr}</span>
        {job.applicants > 0 && <span><b>Applicants</b> {job.applicants}</span>}
      </div>
      <div className="job-card-footer">
        <div className="job-skills">
          {job.skills?.slice(0, 3).map(s => <span key={s} className="skill-tag">{s}</span>)}
        </div>
        <span className="job-posted">{posted}</span>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [remote, setRemote] = useState(searchParams.get('remote') || '');
  const [salaryIdx, setSalaryIdx] = useState(0);
  const [expIdx, setExpIdx] = useState(0);
  const [page, setPage] = useState(1);
  const [keyInput, setKeyInput] = useState(keyword);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const sal = SALARY_OPTIONS[salaryIdx];
      const exp = EXP_OPTIONS[expIdx];
      const params = new URLSearchParams({ limit: 15, page });
      if (keyword) params.set('keyword', keyword);
      if (location) params.set('location', location);
      if (category) params.set('category', category);
      if (type) params.set('type', type);
      if (remote) params.set('remote', remote);
      if (sal.min) params.set('minSalary', sal.min);
      if (sal.max) params.set('maxSalary', sal.max);
      if (exp.min) params.set('minExp', exp.min);
      if (exp.max) params.set('maxExp', exp.max);

      const res = await api.get(`/jobs?${params}`);
      setJobs(res.data.data || []);
      setPagination(res.data.pagination || { total: 0, pages: 1, page: 1 });

      const urlParams = new URLSearchParams();
      if (keyword) urlParams.set('keyword', keyword);
      if (location) urlParams.set('location', location);
      if (category) urlParams.set('category', category);
      if (type) urlParams.set('type', type);
      setSearchParams(urlParams, { replace: true });
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, location, category, type, remote, salaryIdx, expIdx, page, setSearchParams]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  useEffect(() => {
    if (!user) {
      setSavedJobIds(new Set());
      return;
    }

    api.get('/jobs/saved')
      .then(res => setSavedJobIds(new Set((res.data.data || []).map(job => job._id))))
      .catch(() => {});
  }, [user]);

  const clearFilters = () => {
    setKeyword('');
    setKeyInput('');
    setLocation('');
    setCategory('');
    setType('');
    setRemote('');
    setSalaryIdx(0);
    setExpIdx(0);
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(keyInput);
    setPage(1);
  };

  const handleToggleSave = async (jobId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const nextSaved = new Set(savedJobIds);
    const shouldUnsave = nextSaved.has(jobId);
    if (shouldUnsave) nextSaved.delete(jobId);
    else nextSaved.add(jobId);
    setSavedJobIds(nextSaved);

    try {
      if (shouldUnsave) await api.delete(`/jobs/${jobId}/save`);
      else await api.post(`/jobs/${jobId}/save`);
    } catch {
      setSavedJobIds(new Set(savedJobIds));
    }
  };

  return (
    <div className="jobs-page">
      <div className="jobs-search-bar">
        <form className="jobs-search-form" onSubmit={handleSearch}>
          <div className="jsf-field">
            <span>Search</span>
            <input
              id="jobs-keyword"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="Job title, keyword, company..."
            />
          </div>
          <div className="jsf-field">
            <span>Place</span>
            <select id="jobs-location" value={location} onChange={e => { setLocation(e.target.value); setPage(1); }}>
              <option value="">All Locations</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <button type="submit" className="jsf-btn">Search</button>
        </form>
      </div>

      <div className="jobs-layout">
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h3>Filters</h3>
            <button className="clear-filters-btn" onClick={clearFilters}>Clear All</button>
          </div>

          <div className="filter-group">
            <label className="filter-label" htmlFor="filter-category">Category</label>
            <select id="filter-category" className="filter-select" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Job Type</label>
            <div className="filter-checkboxes">
              {JOB_TYPES.map(t => (
                <label key={t} className="filter-check">
                  <input type="radio" name="type" checked={type === t} onChange={() => { setType(type === t ? '' : t); setPage(1); }} />
                  <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label" htmlFor="filter-exp">Experience</label>
            <select id="filter-exp" className="filter-select" value={expIdx} onChange={e => { setExpIdx(Number(e.target.value)); setPage(1); }}>
              {EXP_OPTIONS.map((o, i) => <option key={o.label} value={i}>{o.label}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label" htmlFor="filter-salary">Salary (per annum)</label>
            <select id="filter-salary" className="filter-select" value={salaryIdx} onChange={e => { setSalaryIdx(Number(e.target.value)); setPage(1); }}>
              {SALARY_OPTIONS.map((o, i) => <option key={o.label} value={i}>{o.label}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-check">
              <input type="checkbox" checked={remote === 'true'} onChange={e => { setRemote(e.target.checked ? 'true' : ''); setPage(1); }} />
              <span>Remote Only</span>
            </label>
          </div>
        </aside>

        <main className="jobs-results">
          <div className="results-header">
            <p className="results-count">
              {loading ? 'Loading...' : (
                <>
                  Showing <strong>{jobs.length}</strong> of <strong>{pagination.total.toLocaleString()}</strong> jobs
                  {keyword && <> for "<strong>{keyword}</strong>"</>}
                  {location && <> in <strong>{location}</strong></>}
                </>
              )}
            </p>
          </div>

          {loading ? (
            <div className="results-loading">
              {[...Array(6)].map((_, i) => <div key={i} className="job-card-skeleton" />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">0</div>
              <h3>No jobs found</h3>
              <p>Try adjusting your filters or search terms.</p>
              <button className="btn-outline" onClick={clearFilters}>Clear All Filters</button>
            </div>
          ) : (
            <>
              <div className="results-list">
                {jobs.map(job => (
                  <JobCard
                    key={job._id}
                    job={job}
                    isSaved={savedJobIds.has(job._id)}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="pagination">
                  <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                  {[...Array(Math.min(pagination.pages, 7))].map((_, i) => {
                    const p = i + 1;
                    return (
                      <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                    );
                  })}
                  {pagination.pages > 7 && <span className="page-ellipsis">...</span>}
                  <button className="page-btn" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
