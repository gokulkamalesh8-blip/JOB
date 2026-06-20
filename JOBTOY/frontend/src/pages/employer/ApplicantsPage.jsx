import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function ApplicantsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicantsAndJob();
  }, [jobId]);

  const fetchApplicantsAndJob = async () => {
    setLoading(true);
    try {
      const jobRes = await api.get(`/jobs/${jobId}`);
      setJob(jobRes.data.data);

      const applicantsRes = await api.get(`/applications/job/${jobId}`);
      setApplicants(applicantsRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load application listings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      toast.success(`Application status updated to ${newStatus}`);
      fetchApplicantsAndJob();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in bg-radial-grid" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading applicants details...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-radial-grid" style={{ minHeight: '80vh', padding: '3rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Navigation Breadcrumb & Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <button
            onClick={() => navigate('/employer/dashboard')}
            style={{ background: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Job Applicants
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Reviewing candidates for <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{job?.title}</span>
          </p>
        </div>

        {/* Applicants List */}
        {applicants.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              No applicants yet
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              This position hasn't received any candidate applications yet. Ensure your job description is detailed and competitive.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '2rem' }}>
            {applicants.map((app) => (
              <div key={app._id} className="card" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                  
                  {/* Candidate Identity */}
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.25rem'
                    }}>
                      {app.candidate?.name ? app.candidate.name.charAt(0).toUpperCase() : 'C'}
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                        {app.candidate?.name}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        {app.candidate?.email}
                      </p>

                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {app.candidate?.profile?.location && (
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            📍 {app.candidate.profile.location}
                          </span>
                        )}
                        {app.candidate?.resumeUrl && (
                          <a
                            href={app.candidate.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 700 }}
                          >
                            📄 Download Resume
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Action Selector */}
                  <div className="form-group" style={{ width: '180px', marginBottom: 0 }}>
                    <label className="form-label">Application Status</label>
                    <select
                      className="input-field"
                      value={app.status}
                      onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                    >
                      <option value="applied">Applied</option>
                      <option value="reviewing">Under Review</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offered">Offered</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                </div>

                {/* Candidate bio & skills */}
                {app.candidate?.profile?.bio && (
                  <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    <span style={{ fontWeight: 700, display: 'block', marginBottom: '0.25rem', color: 'var(--text-main)' }}>Candidate Bio</span>
                    {app.candidate.profile.bio}
                  </div>
                )}

                {app.candidate?.profile?.skills && app.candidate.profile.skills.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    {app.candidate.profile.skills.map((skill, sIdx) => (
                      <span key={sIdx} className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>{skill}</span>
                    ))}
                  </div>
                )}

                {/* Cover Letter */}
                {app.coverLetter && (
                  <div style={{ marginTop: '1.5rem', borderTop: '1px dashed var(--border)', paddingTop: '1.5rem' }}>
                    <h5 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Submitted Cover Letter</h5>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{app.coverLetter}</p>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
