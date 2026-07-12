export default function TalentSolutions() {
  return (
    <div className="animate-fade-in bg-radial-grid" style={{ minHeight: '80vh', padding: '5rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '950px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <span className="badge badge-yellow" style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}>Grow Your Team</span>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
            Enterprise <span className="text-gradient-purple">Talent Solutions</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', maxWidth: '650px', margin: '0 auto' }}>
            From simple single listings to fully-managed candidate pipelines, we provide the ultimate toolset to source, interview, and onboard talent.
          </p>
        </div>

        {/* Pricing/Plan Tiers */}
        <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '3rem' }}>Flexible Pricing Plans</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2.5rem',
          alignItems: 'stretch',
          marginBottom: '6rem'
        }}>
          {/* Free Tier */}
          <div className="card" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Starter</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>For recruiters starting out.</p>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '2rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>$0</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginLeft: '0.25rem' }}>/ forever</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', padding: 0, marginBottom: '2.5rem' }}>
                <li>✓ Post up to 3 job listings</li>
                <li>✓ Standard search indexing</li>
                <li>✓ Receive candidate applications</li>
                <li>✓ Basic candidate stats</li>
              </ul>
            </div>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => alert('Starter plan is default for all registered companies!')}>
              Current Plan
            </button>
          </div>

          {/* Premium Tier */}
          <div className="card" style={{
            padding: '3rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '2px solid var(--primary)',
            boxShadow: 'var(--shadow-glow)',
            position: 'relative'
          }}>
            <span className="badge badge-blue" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', padding: '0.35rem 0.75rem' }}>Popular</span>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>Pro recruiter</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>For growing technology startups.</p>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '2rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>$99</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginLeft: '0.25rem' }}>/ month</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', padding: 0, marginBottom: '2.5rem' }}>
                <li>✓ Post unlimited job listings</li>
                <li>✓ Featured badge on landing page</li>
                <li>✓ Instant candidate matching alerts</li>
                <li>✓ Direct application status email logs</li>
                <li>✓ API access to candidates database</li>
              </ul>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => alert('Enterprise payments are not enabled in this demo project.')}>
              Upgrade to Pro
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="card" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Enterprise</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>For large global teams.</p>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '2rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>Custom</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginLeft: '0.25rem' }}>/ bespoke pricing</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', padding: 0, marginBottom: '2.5rem' }}>
                <li>✓ Dedicated account manager</li>
                <li>✓ Custom contract integrations</li>
                <li>✓ Automated CSV reports</li>
                <li>✓ Direct slack community channel</li>
                <li>✓ Custom background verifications</li>
              </ul>
            </div>
            <button className="btn btn-secondary" style={{ width: '100%', border: '2px solid var(--border-hover)' }} onClick={() => alert('Contacting corporate team... (Mock Alert)')}>
              Contact Sales
            </button>
          </div>
        </div>

        {/* Talent Stats */}
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.25rem' }}>Scale Your Hiring Effortlessly</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            Our global sourcing tool filters resumes dynamically by matching semantic keywords and skills tags directly with candidate applications.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>15 Days</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVERAGE TIME-TO-HIRE</p>
            </div>
            <div style={{ width: '1px', background: 'var(--border-hover)', alignSelf: 'stretch' }}></div>
            <div>
              <h4 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary)' }}>45,000+</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>MONTHLY APPLICATIONS FILED</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
