import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or sessionStorage
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - log as warning instead of error
      console.warn('Unauthorized access. Please log in again.');
      // You can redirect to login page or clear auth state here
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        sessionStorage.removeItem('access_token');
      }
    }
    return Promise.reject(error);
  }
);

export { apiClient }; 