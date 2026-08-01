import axios from 'axios';

// Get base URL from environment or fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Automatically attach access tokens if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Capture request tracing headers & handle refresh token rotation
api.interceptors.response.use(
  (response) => {
    // Dynamically emit trace header for real-time UI logging diagnostics
    const reqIdHeader = response.headers['x-request-id'] || response.headers['X-Request-Id'];
    if (reqIdHeader) {
      window.dispatchEvent(new CustomEvent('api-trace', { detail: { requestId: reqIdHeader } }));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Standard trace capture even on error responses
    if (error.response?.headers) {
      const reqIdHeader = error.response.headers['x-request-id'] || error.response.headers['X-Request-Id'];
      if (reqIdHeader) {
        window.dispatchEvent(new CustomEvent('api-trace', { detail: { requestId: reqIdHeader } }));
      }
    }

    // Refresh token rotation triggered on 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token active');
        }

        // Post session rotation query to the backend using legacy/v1 path mapping
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { token: refreshToken });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

        // Persist new access + refresh pair
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Replay original request with fresh authorization signature
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed or is expired -> perform session teardown
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('auth-logout'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
