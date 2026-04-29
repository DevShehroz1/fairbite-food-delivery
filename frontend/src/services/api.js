import axios from 'axios';

// Production (Vercel): use full Render backend URL from env var
// Local / ngrok: use relative /api (proxied by React dev server → backend)
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fairbite_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fairbite_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
