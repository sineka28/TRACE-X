const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  
  const headers = {
    ...options.headers,
  };

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.detail || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Demo
  seedDemo: () => request('/demo/seed', { method: 'POST' }),
  getDemoStatus: () => request('/demo/status'),

  // Investigations
  getInvestigations: () => request('/investigations'),
  getInvestigation: (id) => request(`/investigations/${id}`),
  createInvestigation: (payload) =>
    request('/investigations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateInvestigation: (id, payload) =>
    request(`/investigations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteInvestigation: (id) =>
    request(`/investigations/${id}`, {
      method: 'DELETE',
    }),

  // Evidence
  getAllEvidence: () => request('/evidence'),
  getInvestigationEvidence: (invId) => request(`/investigations/${invId}/evidence`),
  uploadEvidence: (invId, formData) =>
    request(`/investigations/${invId}/evidence`, {
      method: 'POST',
      body: formData,
    }),
  deleteEvidence: (id) =>
    request(`/evidence/${id}`, {
      method: 'DELETE',
    }),

  // Analysis
  runAnalysis: (invId) =>
    request(`/investigations/${invId}/analyze`, {
      method: 'POST',
    }),
  getTimeline: (invId) => request(`/investigations/${invId}/timeline`),
  getHypotheses: (invId) => request(`/investigations/${invId}/hypotheses`),
  getEvidenceGraph: (invId) => request(`/investigations/${invId}/graph`),
  getFullAnalysis: (invId) => request(`/investigations/${invId}/analysis`),
  getAllAnalyses: () => request('/analysis'),

  // Reports
  getReports: () => request('/reports'),
  getReport: (id) => request(`/reports/${id}`),
  generateReport: (invId) =>
    request(`/investigations/${invId}/report`, {
      method: 'POST',
    }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) =>
    request(`/notifications/${id}/read`, {
      method: 'POST',
    }),
};
