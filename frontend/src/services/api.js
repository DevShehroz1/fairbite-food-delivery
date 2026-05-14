import axios from 'axios';

// Production: read from env var if set, else fall back to the deployed backend.
// Local dev: relative /api gets proxied to the local backend by react-scripts.
const PROD_API = 'https://quickbite-backend-two.vercel.app/api';
const isLocal = typeof window !== 'undefined'
  && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const baseURL = process.env.REACT_APP_API_URL
  || (isLocal ? '/api' : PROD_API);

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('quickbite_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('quickbite_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
