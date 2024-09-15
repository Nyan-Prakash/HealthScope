// src/services/api.js
import axios from 'axios';

// Create an Axios instance with default configurations
const instance = axios.create({
  baseURL: 'http://localhost:8000', // Base URL of your FastAPI backend
  timeout: 60000, // Timeout set to 10 seconds
});

// Optional: Add a request interceptor (if you need to add headers like authorization)
instance.interceptors.request.use(
  (config) => {
    // Modify the request configuration if needed, e.g., add headers
    // config.headers.Authorization = `Bearer ${your_token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor (if you need to handle errors globally)
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle error globally, e.g., show notification
    console.error('API error:', error);
    return Promise.reject(error);
  }
);

export default instance;
