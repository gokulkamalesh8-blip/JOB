import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const { user, login, token } = useAuth();
  const [profile, setProfile] = useState({
    bio: '',
    location: '',
    phone: '',
    skills: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        bio: user.profile?.bio || '',
        location: user.profile?.location || '',
        phone: user.profile?.phone || '',
        skills: user.profile?.skills?.join(', ') || ''
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);

    try {
      const skillsArray = profile.skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const res = await api.put(`/users/${user._id}`, {
        profile: {
          bio: profile.bio,
          location: profile.location,
          phone: profile.phone,
          skills: skillsArray
        }
      });

      // Update auth context
      login(token, res.data.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    setUploadingResume(true);
    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      const res = await api.post('/users/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      login(token, res.data.data);
      toast.success('Resume uploaded successfully!');
      setResumeFile(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  return (
    <div className="animate-fade-in bg-radial-grid" style={{ minHeight: '80vh', padding: '3rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '2rem' }}>
          Profile Settings
        </h1>

        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {/* Details Card */}
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Professional Profile</h2>
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="profile-bio">Bio / Summary</label>
                <textarea
                  id="profile-bio"
                  rows="3"
                  className="input-field"
                  placeholder="Tell recruiters about yourself..."
                  style={{ resize: 'vertical' }}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="profile-skills">Skills (comma separated)</label>
                <input
                  type="text"
                  id="profile-skills"
                  className="input-field"
                  placeholder="React, Node.js, TypeScript, Figma"
                  value={profile.skills}
                  onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="profile-location">Location</label>
                <input
                  type="text"
                  id="profile-location"
                  className="input-field"
                  placeholder="City, State"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="profile-phone">Phone Number</label>
                <input
                  type="tel"
                  id="profile-phone"
                  className="input-field"
                  placeholder="+91 98765 43210"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%' }} disabled={updatingProfile}>
                {updatingProfile ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Resume Upload Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justify: 'space-between', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Manage Resume</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Upload your latest CV in PDF format. Recruiters can view it when you apply for jobs.
              </p>

              {user?.resumeUrl ? (
                <div style={{
                  background: 'rgba(79, 70, 229, 0.06)',
                  border: '1px dashed var(--primary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1.25rem',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📄</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Your Resume.pdf</span>
                      <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                        View Document
                      </a>
                    </div>
                  </div>
                  <span className="badge badge-green">Uploaded</span>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px dashed #ef4444',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1.25rem',
                  marginBottom: '2rem',
                  textAlign: 'center',
                  fontSize: '0.8125rem',
                  color: '#b91c1c',
                  fontWeight: 600
                }}>
                  No resume uploaded. Please upload a PDF to apply for jobs.
                </div>
              )}
            </div>

            <form onSubmit={handleResumeUpload} style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="resume-file">Choose PDF File</label>
                <input
                  type="file"
                  id="resume-file"
                  accept=".pdf"
                  required
                  className="input-field"
                  style={{ padding: '0.5rem' }}
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
              </div>
              <button type="submit" className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={uploadingResume}>
                {uploadingResume ? 'Uploading...' : 'Upload PDF'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
