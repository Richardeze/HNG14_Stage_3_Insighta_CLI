const axios = require('axios');
const { loadCredentials, saveCredentials, clearCredentials } = require('./auth');

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: BACKEND_URL,
});

// REQUEST interceptor — runs before every request
// Adds auth headers automatically
api.interceptors.request.use((config) => {
  const creds = loadCredentials();

  if (creds && creds.access_token) {
    config.headers['Authorization'] = `Bearer ${creds.access_token}`;
  }

  // Every /api/* request needs this header
  if (config.url && config.url.startsWith('/api/')) {
    config.headers['X-API-Version'] = '1';
  }

  return config;
});

// RESPONSE interceptor — runs after every response
// If we get 401, try to refresh the token, then retry the original request
api.interceptors.response.use(
  (response) => response, // success — just return it

  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // mark so we don't loop forever

      const creds = loadCredentials();
      if (!creds || !creds.refresh_token) {
        clearCredentials();
        console.error('\nSession expired. Please run: insighta login');
        process.exit(1);
      }

      try {
        // Try to get a new access token
        const refreshResponse = await axios.post(
          `${BACKEND_URL}/auth/refresh`,
          { refresh_token: creds.refresh_token }
        );

        const { access_token, refresh_token } = refreshResponse.data;

        // Save the new tokens
        saveCredentials({
          ...creds,
          access_token,
          refresh_token,
        });

        // Retry the original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh failed — tokens fully expired, must re-login
        clearCredentials();
        console.error('\nSession expired. Please run: insighta login');
        process.exit(1);
      }
    }

    return Promise.reject(error);
  }
);

module.exports = api;