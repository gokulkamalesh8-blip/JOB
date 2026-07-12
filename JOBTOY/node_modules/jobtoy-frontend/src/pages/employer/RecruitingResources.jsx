export default function RecruitingResources() {
  return (
    <div className="animate-fade-in bg-radial-grid" style={{ minHeight: '80vh', padding: '5rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '950px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="badge badge-cyan" style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}>Employer Portal</span>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
            Recruiting <span className="text-gradient">Resources</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
            Accelerate your hiring cycles with recruitment checklists, technical interview scorecards, and platform guidelines.
          </p>
        </div>

        {/* Resources Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {[
            {
              title: 'Drafting Effective Job Descriptions',
              category: 'Guides',
              desc: 'Learn how to structure titles, detail salary ranges, highlight requirements, and promote company culture to drive 3x more qualified applications.',
              linkText: 'Download PDF Guide'
            },
            {
              title: 'Technical Interview Scorecards',
              category: 'Templates',
              desc: 'Standardize engineering interview feedback across coding skills, architectural depth, system design, and communication using our rating scorecard.',
              linkText: 'Access Template'
            },
            {
              title: 'Diversity Sourcing Best Practices',
              category: 'Best Practices',
              desc: 'Actionable tactics to reduce gender bias in job posts, structure blind resume reviews, and actively source underrepresented technical candidates.',
              linkText: 'Read Full Article'
            },
            {
              title: 'Remote Employee Onboarding Checklist',
              category: 'Checklists',
              desc: 'Ensure your newly hired engineers and designers get up to speed from day one. Includes hardware setups, git repository access, and team intro structures.',
              linkText: 'View Checklist'
            },
            {
              title: 'Platform Hiring Analytics Report',
              category: 'Market Reports',
              desc: 'Explore compensation benchmarks, location supply trends, and hiring velocity metrics compiled from 50,000+ active candidates on JobPortal.',
              linkText: 'Download Report'
            },
            {
              title: 'Recruitment Email Sequences',
              category: 'Templates',
              desc: 'Copy-paste sequences for reaching out to passive talent, sending interview invites, extending offers, and delivering constructive rejection emails.',
              linkText: 'Copy Templates'
            }
          ].map((res, idx) => (
            <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2.25rem 2rem' }}>
              <div>
                <span className="badge badge-blue" style={{ marginBottom: '1rem' }}>{res.category}</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>{res.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>{res.desc}</p>
              </div>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); alert(`${res.title} download triggered! (Mock demo)`); }}
                style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                {res.linkText} <span>→</span>
              </a>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
