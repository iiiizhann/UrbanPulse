import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  timeout: 8000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('urbanpulse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (data) => API.post('/auth/register', data),
  getMe: () => API.get('/auth/me'),
};

export const analyticsApi = {
  getLatest: (city) => API.get('/analytics/latest', { params: { city } }),
  getTrends: (city, hours = 24) => API.get('/analytics/trends', { params: { city, hours } }),
  getPipelineLogs: (limit = 25) => API.get('/analytics/pipeline-logs', { params: { limit } }),
  triggerManualETL: (city) => API.post('/analytics/trigger-etl', { city }),
};
export default API;