import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const categories = [
  { name: 'Technology', icon: 'TE', count: '1,840+' },
  { name: 'Data & Analytics', icon: 'DA', count: '620+' },
  { name: 'Product', icon: 'PR', count: '380+' },
  { name: 'Design', icon: 'UX', count: '290+' },
  { name: 'Marketing', icon: 'MK', count: '410+' },
  { name: 'Sales', icon: 'SA', count: '560+' },
  { name: 'Finance', icon: 'FI', count: '320+' },
  { name: 'Human Resources', icon: 'HR', count: '280+' },
  { name: 'Operations', icon: 'OP', count: '350+' },
];

const popularSearches = [
  'React Developer', 'Data Scientist', 'Product Manager', 'Python Developer',
  'DevOps Engineer', 'Fresher Jobs', 'Remote Jobs', 'UI/UX Designer', 'Digital Marketing',
];

const fallbackLocations = ['Bangalore', 'Mumbai', 'Hyderabad', 'Chennai', 'Pune', 'Noida', 'Gurugram', 'Delhi', 'Remote'];

const trendingCompanies = [
  { name: 'Google', logo: 'https://logo.clearbit.com/google.com' },
  { name: 'Microsoft', logo: 'https://logo.clearbit.com/microsoft.com' },
  { name: 'Amazon', logo: 'https://logo.clearbit.com/amazon.com' },
  { name: 'Flipkart', logo: 'https://logo.clearbit.com/flipkart.com' },
  { name: 'Swiggy', logo: 'https://logo.clearbit.com/swiggy.com' },
  { name: 'Razorpay', logo: 'https://logo.clearbit.com/razorpay.com' },
  { name: 'Zomato', logo: 'https://logo.clearbit.com/zomato.com' },
  { name: 'Freshworks', logo: 'https://logo.clearbit.com/freshworks.com' },
  { name: 'Infosys', logo: 'https://logo.clearbit.com/infosys.com' },
  { name: 'TCS', logo: 'https://logo.clearbit.com/tcs.com' },
  { name: 'Zoho', logo: 'https://logo.clearbit.com/zoho.com' },
  { name: 'PhonePe', logo: 'https://logo.clearbit.com/phonepe.com' },
];

const stats = [
  { value: '5,000+', label: 'Live Jobs', icon: 'LJ' },
  { value: '50+', label: 'Top Companies', icon: 'TC' },
  { value: '12K+', label: 'Happy Candidates', icon: 'HC' },
  { value: '98%', label: 'Success Rate', icon: 'SR' },
];

const howItWorks = [
  { step: '01', title: 'Create Your Profile', desc: 'Sign up and build a professional profile with your skills, experience, and resume.', icon: 'ID' },
  { step: '02', title: 'Browse & Search Jobs', desc: 'Explore thousands of jobs from top companies. Filter by role, location, salary, and more.', icon: 'SE' },
  { step: '03', title: 'Apply in One Click', desc: 'Apply to multiple jobs instantly. Track every application from your personal dashboard.', icon: 'AP' },
  { step: '04', title: 'Get Hired', desc: 'Get shortlisted, appear for interviews, and land your dream job.', icon: 'HI' },
];

const careerActions = [
  { title: 'Upload resume', desc: 'Get noticed by recruiters actively hiring today.', cta: 'Create profile', to: '/register' },
  { title: 'Explore companies', desc: 'Research hiring teams, benefits, and open roles.', cta: 'View companies', to: '/companies' },
  { title: 'Recruiter tools', desc: 'Post jobs and manage applicants in one workspace.', cta: 'Post a job', to: '/employer/post-job' },
];

function JobCard({ job, isSaved, onToggleSave }) {
  const nav = useNavigate();
  const salStr = job.salary?.min && job.salary?.max
    ? `INR ${(job.salary.min / 100000).toFixed(1)}L - INR ${(job.salary.max / 100000).toFixed(1)}L`
    : 'Salary not disclosed';
  const expStr = job.experience?.max === 0 ? 'Fresher' : `${job.experience?.min || 0}-${job.experience?.max || '?'} yrs`;
  const logo = job.company?.logoUrl;
  const daysAgo = Math.floor((Date.now() - new Date(job.createdAt)) / 86400000);
  const posted = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;

  return (
    <div className="job-card" onClick={() => nav(`/jobs/${job._id}`)} role="button" tabIndex={0}>
      <div className="job-card-header">
        <div className="company-logo-wrap">
          {logo
            ? <img src={logo} alt={job.company?.name} onError={e => { e.currentTarget.style.display = 'none'; }} />
            : <span className="logo-placeholder">{job.company?.name?.[0] || 'J'}</span>
          }
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
        <span><b>Location</b> {job.location || 'Location TBD'}</span>
        <span><b>Salary</b> {salStr}</span>
        <span><b>Experience</b> {expStr}</span>
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

export default function Home() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [jobMeta, setJobMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animIdx, setAnimIdx] = useState(0);
  const stripRef = useRef(null);

  const placeholders = ['Search job title, keyword...', 'React Developer...', 'Data Scientist...', 'Product Manager...'];
  const liveCompanies = jobMeta?.topCompanies?.length
    ? jobMeta.topCompanies.map(c => ({
        name: c.shortName || c.name,
        logo: c.logoUrl || c.logo || `https://logo.clearbit.com/${String(c.website || '').replace(/^https?:\/\//, '')}`,
      }))
    : trendingCompanies;
  const livePopularSearches = jobMeta?.skills?.length ? jobMeta.skills.slice(0, 9) : popularSearches;
  const liveLocations = jobMeta?.locations?.length ? jobMeta.locations.slice(0, 12) : fallbackLocations;
  const liveStats = [
    { value: jobMeta?.totalJobs ? `${jobMeta.totalJobs.toLocaleString()}+` : stats[0].value, label: 'Live Jobs', icon: 'LJ' },
    { value: jobMeta?.topCompanies?.length ? `${jobMeta.topCompanies.length}+` : stats[1].value, label: 'Top Companies', icon: 'TC' },
    ...stats.slice(2),
  ];

  useEffect(() => {
    api.get('/jobs?limit=9&sort=-createdAt').then(r => {
      setFeaturedJobs(r.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) {
      setSavedJobIds(new Set());
      return;
    }

    api.get('/jobs/saved')
      .then(r => setSavedJobIds(new Set((r.data.data || []).map(job => job._id))))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    api.get('/jobs/meta').then(r => {
      setJobMeta(r.data.data || null);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setAnimIdx(i => (i + 1) % placeholders.length), 2500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return undefined;
    let frame;
    let pos = 0;
    const scroll = () => {
      pos += 0.4;
      if (pos >= strip.scrollWidth / 2) pos = 0;
      strip.scrollLeft = pos;
      frame = requestAnimationFrame(scroll);
    };
    frame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (location) params.set('location', location);
    nav(`/jobs?${params.toString()}`);
  };

  const handleToggleSave = async (jobId) => {
    if (!user) {
      nav('/login');
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
      const rollback = new Set(savedJobIds);
      setSavedJobIds(rollback);
    }
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-bg-shapes" aria-hidden="true">
          <div className="hero-shape shape-1" />
          <div className="hero-shape shape-2" />
          <div className="hero-shape shape-3" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">Trusted job search for Indian professionals</div>
          <h1 className="hero-title">
            Find jobs that match<br />
            <span className="gradient-text">your skills and salary goals</span>
          </h1>
          <p className="hero-subtitle">
            Search verified openings from leading companies, save the roles you like,
            and apply faster with a complete profile.
          </p>

          <form className="hero-search-form" onSubmit={handleSearch}>
            <div className="search-field">
              <span className="search-icon">Search</span>
              <input
                id="hero-keyword"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder={placeholders[animIdx]}
                className="search-input"
              />
            </div>
            <div className="search-divider" />
            <div className="search-field">
              <span className="search-icon">Place</span>
              <select
                id="hero-location"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="search-input search-select"
              >
                <option value="">All Locations</option>
                {liveLocations.map(l =>
                  <option key={l} value={l}>{l}</option>
                )}
              </select>
            </div>
            <button type="submit" className="search-btn">Search Jobs</button>
          </form>

          <div className="popular-searches">
            <span className="popular-label">Popular:</span>
            {livePopularSearches.map(s => (
              <button key={s} className="popular-tag" onClick={() => nav(`/jobs?keyword=${encodeURIComponent(s)}`)}>
                {s}
              </button>
            ))}
          </div>

          <div className="career-actions">
            {careerActions.map(action => (
              <Link key={action.title} to={action.to} className="career-action-card">
                <span className="career-action-title">{action.title}</span>
                <span className="career-action-desc">{action.desc}</span>
                <span className="career-action-link">{action.cta}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="hero-stats">
          {liveStats.map(st => (
            <div key={st.label} className="stat-card">
              <span className="stat-icon">{st.icon}</span>
              <span className="stat-value">{st.value}</span>
              <span className="stat-label">{st.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="company-strip-section">
        <p className="strip-label">Trusted by India's top companies</p>
        <div className="company-strip" ref={stripRef}>
          {[...liveCompanies, ...liveCompanies].map((c, i) => (
            <div key={`${c.name}-${i}`} className="strip-company">
              <img src={c.logo} alt={c.name} onError={e => { e.currentTarget.style.display = 'none'; }} />
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section categories-section">
        <div className="section-header">
          <h2 className="section-title">Browse by <span className="gradient-text">Category</span></h2>
          <p className="section-subtitle">Explore jobs across every industry and domain</p>
        </div>
        <div className="categories-grid">
          {categories.map(cat => (
            <button key={cat.name} className="category-card" onClick={() => nav(`/jobs?category=${encodeURIComponent(cat.name)}`)}>
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-name">{cat.name}</span>
              <span className="cat-count">{cat.count} jobs</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section featured-jobs-section">
        <div className="section-header section-header-row">
          <div>
            <h2 className="section-title">Latest <span className="gradient-text">Job Openings</span></h2>
            <p className="section-subtitle">Fresh opportunities from verified employers</p>
          </div>
          <Link to="/jobs" className="view-all-btn">View All Jobs</Link>
        </div>
        {loading ? (
          <div className="jobs-loading">
            {[...Array(6)].map((_, i) => <div key={i} className="job-card-skeleton" />)}
          </div>
        ) : (
          <div className="jobs-grid">
            {featuredJobs.map(job => (
              <JobCard
                key={job._id}
                job={job}
                isSaved={savedJobIds.has(job._id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        )}
        <div className="view-all-center">
          <Link to="/jobs" className="btn-primary-lg">Explore All 5,000+ Jobs</Link>
        </div>
      </section>

      <section className="section how-section">
        <div className="section-header">
          <h2 className="section-title">How <span className="gradient-text">It Works</span></h2>
          <p className="section-subtitle">Land your dream job in four simple steps</p>
        </div>
        <div className="how-grid">
          {howItWorks.map((step, i) => (
            <div key={step.step} className="how-card">
              <div className="how-step-num">{step.step}</div>
              <div className="how-icon">{step.icon}</div>
              <h3 className="how-title">{step.title}</h3>
              <p className="how-desc">{step.desc}</p>
              {i < howItWorks.length - 1 && <div className="how-arrow" aria-hidden="true" />}
            </div>
          ))}
        </div>
      </section>

      {!user && (
        <section className="cta-section">
          <div className="cta-bg" />
          <div className="cta-content">
            <h2 className="cta-title">Ready to take the next step?</h2>
            <p className="cta-subtitle">Join 12,000+ candidates who found their dream jobs through our platform.</p>
            <div className="cta-buttons">
              <Link to="/register" className="cta-btn-primary">Create Free Account</Link>
              <Link to="/jobs" className="cta-btn-outline">Browse Jobs</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
