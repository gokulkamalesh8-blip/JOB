import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const INDUSTRIES = ['All','Technology','IT Services','E-Commerce','Fintech','SaaS','Food Tech','EdTech','Healthtech','Logistics','Gaming','Travel','HRtech','DevTools','Quick Commerce'];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [filtered,  setFiltered]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [industry,  setIndustry]  = useState('All');

  useEffect(() => {
    api.get('/companies?limit=100').then(res => {
      const data = res.data.data || [];
      setCompanies(data);
      setFiltered(data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = companies;
    if (search) result = result.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    if (industry !== 'All') result = result.filter(c => c.industry === industry);
    setFiltered(result);
  }, [search, industry, companies]);

  return (
    <div className="companies-page">
      {/* Hero */}
      <div className="companies-hero">
        <h1 className="companies-hero-title">
          Explore <span className="gradient-text">Top Companies</span> Hiring Now
        </h1>
        <p className="companies-hero-sub">
          Discover and apply to the most innovative companies across India
        </p>

        <div className="companies-search-bar">
          <input
            id="company-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search companies..."
            className="companies-search-input"
          />
        </div>

        <div className="industry-tabs">
          {INDUSTRIES.map(ind => (
            <button
              key={ind}
              className={`industry-tab ${industry === ind ? 'active' : ''}`}
              onClick={() => setIndustry(ind)}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Results Info */}
      <div className="companies-container">
        <p className="companies-count">
          Showing <strong>{filtered.length}</strong> companies
          {industry !== 'All' && <> in <strong>{industry}</strong></>}
        </p>

        {loading ? (
          <div className="companies-grid">
            {[...Array(12)].map((_,i) => <div key={i} className="company-card-skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🏢</div>
            <h3>No companies found</h3>
            <p>Try a different search or industry</p>
          </div>
        ) : (
          <div className="companies-grid">
            {filtered.map(company => (
              <div key={company._id} className="company-card">
                <div className="company-card-logo">
                  {company.logoUrl
                    ? <img src={company.logoUrl} alt={company.name} onError={e => { e.target.style.display='none'; e.target.nextSibling?.style && (e.target.nextSibling.style.display='flex'); }} />
                    : null
                  }
                  <span className="logo-placeholder" style={company.logoUrl ? { display:'none' } : {}}>
                    {company.name?.[0]}
                  </span>
                </div>
                <div className="company-card-body">
                  <h3 className="company-card-name">{company.name}</h3>
                  <p className="company-card-industry">{company.industry}</p>
                  <div className="company-card-meta">
                    {company.location && <span>📍 {company.location}</span>}
                    {company.size     && <span>👥 {company.size} employees</span>}
                  </div>
                  {company.description && (
                    <p className="company-card-desc">
                      {company.description.slice(0, 100)}...
                    </p>
                  )}
                </div>
                <div className="company-card-footer">
                  <Link
                    to={`/jobs?keyword=${encodeURIComponent(company.name)}`}
                    className="view-jobs-btn"
                  >
                    View Open Jobs →
                  </Link>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="company-website-btn"
                    >
                      🌐
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
