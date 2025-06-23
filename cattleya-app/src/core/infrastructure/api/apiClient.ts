import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access. Please log in again.');
      // You can redirect to login page or clear auth state here
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');
    }
    return Promise.reject(error);
  }
);

export { apiClient }; 