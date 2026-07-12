import api from './api';

export const applyForJob = (data) =>
  api.post('/applications', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getMyApplications = ()       => api.get('/applications/me');
export const getApplicants     = (jobId)  => api.get(`/applications/job/${jobId}`);
export const updateStatus      = (id, s)  => api.put(`/applications/${id}/status`, { status: s });
