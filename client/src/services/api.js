const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiConfig = {
  baseUrl: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default API_URL;
