import { useState } from 'react';

export default function AboutUs() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="animate-fade-in bg-radial-grid" style={{ minHeight: '80vh', padding: '5rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="badge badge-blue" style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}>Our Story</span>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
            Empowering Teams and <span className="text-gradient">Careers</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
            We build modern channels to connect talented software builders, interface designers, and product leaders with world-class workspaces.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '5rem'
        }}>
          {[
            { value: '2024', label: 'Year Founded' },
            { value: '50K+', label: 'Registered Candidates' },
            { value: '12K+', label: 'Successful Placements' },
            { value: '98%', label: 'Retention Rate' }
          ].map((item, idx) => (
            <div key={idx} className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <h3 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>{item.value}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>{item.label}</p>
            </div>
          ))}
        </div>

        {/* Core Values Section */}
        <div style={{ marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '3rem' }}>Our Core Values</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {[
              { title: 'Transparency First', desc: 'We promote open salaries, verified job posters, and clear role expectations across all job listings.' },
              { title: 'Developer Centric', desc: 'Our platform is optimized for modern workflows, high-fidelity portfolio uploads, and clean tags.' },
              { title: 'Diversity & Inclusion', desc: 'We partner with remote-first employers seeking global diverse talent across borders.' }
            ].map((v, idx) => (
              <div key={idx} className="card" style={{ padding: '2rem' }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>{v.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="card" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto', boxShadow: 'var(--shadow-lg)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', textAlign: 'center' }}>Get In Touch</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '2rem' }}>
            Have questions or feedback? Drop us a line and our team will get back to you within 24 hours.
          </p>

          {submitted ? (
            <div style={{
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid #10b981',
              color: '#047857',
              borderRadius: 'var(--radius-sm)',
              padding: '1.5rem',
              textAlign: 'center',
              fontWeight: 600
            }}>
              ✓ Thank you! Your message has been sent successfully.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="contact-name">Name</label>
                <input
                  type="text"
                  id="contact-name"
                  required
                  className="input-field"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="contact-email">Email Address</label>
                <input
                  type="email"
                  id="contact-email"
                  required
                  className="input-field"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  required
                  rows="4"
                  className="input-field"
                  placeholder="Tell us what you need..."
                  style={{ resize: 'vertical' }}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
                Send Message
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
