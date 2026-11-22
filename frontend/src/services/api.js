import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.API_URL || 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tu_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('tu_token');
      localStorage.removeItem('tu_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
