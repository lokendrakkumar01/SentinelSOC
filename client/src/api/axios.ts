import axios from 'axios';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const rawApiUrl = (import.meta as any)?.env?.VITE_API_URL;
const defaultBackend = 'https://sentinelsoc-server.onrender.com';
const backendUrl = rawApiUrl 
  ? String(rawApiUrl).replace(/\/$/, '') 
  : (isLocal ? '' : defaultBackend);

const api = axios.create({
  baseURL: backendUrl ? `${backendUrl}/api` : '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
