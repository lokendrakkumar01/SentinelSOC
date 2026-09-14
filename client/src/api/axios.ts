import axios from 'axios';

const rawApiUrl = (import.meta as any)?.env?.VITE_API_URL;
const backendUrl = rawApiUrl ? String(rawApiUrl).replace(/\/$/, '') : '';

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
