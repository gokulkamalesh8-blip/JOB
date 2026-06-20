import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const categories = [
  { name: 'Technology',      icon: '💻', count: '1,840+' },
  { name: 'Data & Analytics',icon: '📊', count: '620+'  },
  { name: 'Product',         icon: '🚀', count: '380+'  },
  { name: 'Design',          icon: '🎨', count: '290+'  },
  { name: 'Marketing',       icon: '📣', count: '410+'  },
  { name: 'Sales',           icon: '📈', count: '560+'  },
  { name: 'Finance',         icon: '💰', count: '320+'  },
  { name: 'Human Resources', icon: '👥', count: '280+'  },
  { name: 'Operations',      icon: '⚙️',  count: '350+'  },
];

const popularSearches = [
  'React Developer','Data Scientist','Product Manager','Python Developer',
  'DevOps Engineer','Fresher Jobs','Remote Jobs','UI/UX Designer','Digital Marketing',
];

const trendingCompanies = [
  { name:'Google',      logo:'https://logo.clearbit.com/google.com'      },
  { name:'Microsoft',   logo:'https://logo.clearbit.com/microsoft.com'   },
  { name:'Amazon',      logo:'https://logo.clearbit.com/amazon.com'      },
  { name:'Flipkart',    logo:'https://logo.clearbit.com/flipkart.com'    },
  { name:'Swiggy',      logo:'https://logo.clearbit.com/swiggy.com'      },
  { name:'Razorpay',    logo:'https://logo.clearbit.com/razorpay.com'    },
  { name:'Zomato',      logo:'https://logo.clearbit.com/zomato.com'      },
  { name:'Freshworks',  logo:'https://logo.clearbit.com/freshworks.com'  },
  { name:'Infosys',     logo:'https://logo.clearbit.com/infosys.com'     },
  { name:'TCS',         logo:'https://logo.clearbit.com/tcs.com'         },
  { name:'Zoho',        logo:'https://logo.clearbit.com/zoho.com'        },
  { name:'PhonePe',     logo:'https://logo.clearbit.com/phonepe.com'     },
];

const stats = [
  { value: '5,000+',  label: 'Live Jobs',          icon: '💼' },
  { value: '50+',     label: 'Top Companies',       icon: '🏢' },
  { value: '12K+',    label: 'Happy Candidates',    icon: '🎯' },
  { value: '98%',     label: 'Success Rate',        icon: '⭐' },
];

const howItWorks = [
  { step:'01', title:'Create Your Profile',   desc:'Sign up and build a professional profile with your skills, experience, and resume.',   icon:'👤' },
  { step:'02', title:'Browse & Search Jobs',  desc:'Explore thousands of jobs from top companies. Filter by role, location, salary, and more.', icon:'🔍' },
  { step:'03', title:'Apply in One Click',    desc:'Apply to multiple jobs instantly. Track every application from your personal dashboard.', icon:'⚡' },
  { step:'04', title:'Get Hired',             desc:'Get shortlisted, appear for interviews, and land your dream job!', icon:'🎉' },
];

function JobCard({ job }) {
  const nav = useNavigate();
  const salStr = job.salary?.min && job.salary?.max
    ? `₹${(job.salary.min/100000).toFixed(1)}L – ₹${(job.salary.max/100000).toFixed(1)}L`
    : 'Salary not disclosed';
  const expStr = job.experience?.max === 0 ? 'Fresher' : `${job.experience?.min || 0}–${job.experience?.max || '?'} yrs`;
  const logo = job.company?.logoUrl;
  const daysAgo = Math.floor((Date.now() - new Date(job.createdAt)) / 86400000);
  const posted = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;

  return (
    <div className="job-card" onClick={() => nav(`/jobs/${job._id}`)}>
      <div className="job-card-header">
        <div className="company-logo-wrap">
          {logo
            ? <img src={logo} alt={job.company?.name} onError={e => e.target.style.display='none'} />
            : <span className="logo-placeholder">{job.company?.name?.[0] || 'J'}</span>
          }
        </div>
        <div className="job-card-meta">
          <h3 className="job-card-title">{job.title}</h3>
          <p className="job-card-company">{job.company?.name || 'Company'}</p>
        </div>
        <span className={`job-type-badge ${job.type}`}>{job.type}</span>
      </div>
      <div className="job-card-details">
        <span>📍 {job.location || 'Location TBD'}</span>
        <span>💰 {salStr}</span>
        <span>🎓 {expStr}</span>
      </div>
      <div className="job-card-footer">
        <div className="job-skills">
          {job.skills?.slice(0,3).map(s => <span key={s} className="skill-tag">{s}</span>)}
        </div>
        <span className="job-posted">{posted}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [keyword,  setKeyword]  = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animIdx, setAnimIdx] = useState(0);
  const stripRef = useRef(null);

  const placeholders = ['Search job title, keyword...', 'React Developer...', 'Data Scientist...', 'Product Manager...'];

  useEffect(() => {
    api.get('/jobs?limit=9&sort=-createdAt').then(r => {
      setFeaturedJobs(r.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setAnimIdx(i => (i + 1) % placeholders.length), 2500);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll company strip
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
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
    if (keyword)  params.set('keyword',  keyword);
    if (location) params.set('location', location);
    nav(`/jobs?${params.toString()}`);
  };

  return (
    <div className="home-page">
      {/* ── Hero ────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-bg-shapes">
          <div className="hero-shape shape-1" />
          <div className="hero-shape shape-2" />
          <div className="hero-shape shape-3" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">🚀 India's Fastest Growing Job Platform</div>
          <h1 className="hero-title">
            Find Your <span className="gradient-text">Dream Job</span><br />
            Among 5,000+ Openings
          </h1>
          <p className="hero-subtitle">
            Connect with top companies like Google, TCS, Flipkart, Razorpay & more.
            Your next big opportunity is just one search away.
          </p>

          <form className="hero-search-form" onSubmit={handleSearch}>
            <div className="search-field">
              <span className="search-icon">🔍</span>
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
              <span className="search-icon">📍</span>
              <select
                id="hero-location"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="search-input search-select"
              >
                <option value="">All Locations</option>
                {['Bangalore','Mumbai','Hyderabad','Chennai','Pune','Noida','Gurugram','Delhi','Remote'].map(l =>
                  <option key={l} value={l}>{l}</option>
                )}
              </select>
            </div>
            <button type="submit" className="search-btn">Search Jobs</button>
          </form>

          <div className="popular-searches">
            <span className="popular-label">Popular:</span>
            {popularSearches.map(s => (
              <button key={s} className="popular-tag"
                onClick={() => nav(`/jobs?keyword=${encodeURIComponent(s)}`)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="hero-stats">
          {stats.map(st => (
            <div key={st.label} className="stat-card">
              <span className="stat-icon">{st.icon}</span>
              <span className="stat-value">{st.value}</span>
              <span className="stat-label">{st.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Company Logo Strip ───────────────────── */}
      <section className="company-strip-section">
        <p className="strip-label">Trusted by India's top companies</p>
        <div className="company-strip" ref={stripRef}>
          {[...trendingCompanies, ...trendingCompanies].map((c, i) => (
            <div key={`${c.name}-${i}`} className="strip-company">
              <img
                src={c.logo}
                alt={c.name}
                onError={e => { e.target.style.display = 'none'; }}
              />
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Job Categories ───────────────────────── */}
      <section className="section categories-section">
        <div className="section-header">
          <h2 className="section-title">Browse by <span className="gradient-text">Category</span></h2>
          <p className="section-subtitle">Explore jobs across every industry and domain</p>
        </div>
        <div className="categories-grid">
          {categories.map(cat => (
            <button
              key={cat.name}
              className="category-card"
              onClick={() => nav(`/jobs?category=${encodeURIComponent(cat.name)}`)}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-name">{cat.name}</span>
              <span className="cat-count">{cat.count} jobs</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Featured Jobs ────────────────────────── */}
      <section className="section featured-jobs-section">
        <div className="section-header">
          <h2 className="section-title">Latest <span className="gradient-text">Job Openings</span></h2>
          <Link to="/jobs" className="view-all-btn">View All Jobs →</Link>
        </div>
        {loading ? (
          <div className="jobs-loading">
            {[...Array(6)].map((_,i) => <div key={i} className="job-card-skeleton" />)}
          </div>
        ) : (
          <div className="jobs-grid">
            {featuredJobs.map(job => <JobCard key={job._id} job={job} />)}
          </div>
        )}
        <div className="view-all-center">
          <Link to="/jobs" className="btn-primary-lg">Explore All 5,000+ Jobs</Link>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────── */}
      <section className="section how-section">
        <div className="section-header">
          <h2 className="section-title">How <span className="gradient-text">It Works</span></h2>
          <p className="section-subtitle">Land your dream job in 4 simple steps</p>
        </div>
        <div className="how-grid">
          {howItWorks.map((step, i) => (
            <div key={step.step} className="how-card">
              <div className="how-step-num">{step.step}</div>
              <div className="how-icon">{step.icon}</div>
              <h3 className="how-title">{step.title}</h3>
              <p className="how-desc">{step.desc}</p>
              {i < howItWorks.length - 1 && <div className="how-arrow">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      {!user && (
        <section className="cta-section">
          <div className="cta-bg" />
          <div className="cta-content">
            <h2 className="cta-title">Ready to take the next step?</h2>
            <p className="cta-subtitle">Join 12,000+ candidates who found their dream jobs through our platform.</p>
            <div className="cta-buttons">
              <Link to="/register" className="cta-btn-primary">Create Free Account</Link>
              <Link to="/jobs"     className="cta-btn-outline">Browse Jobs</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
