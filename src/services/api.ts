import axios from 'axios';
import { storage } from '@/utils/storage';

export const API = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token?.token) {
    config.headers.Authorization = `Bearer ${token.token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      storage.removeToken();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
); 