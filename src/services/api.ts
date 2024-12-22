import axios from 'axios';
import { AuthService } from './auth.service';
import { storage } from '@/utils/storage';

export const API = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавляем токен к каждому запросу
API.interceptors.request.use((config) => {
  const tokenData = storage.getToken();
  if (tokenData?.token) {
    config.headers.Authorization = `Bearer ${tokenData.token}`;
  }
  return config;
});

// Обрабатываем ответы и обновляем токен при необходимости
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('[API] Error interceptor:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      config: error.config
    });

    const originalRequest = error.config;

    // Проверяем, не является ли текущий запрос запросом на обновление токена
    const isRefreshRequest = originalRequest.url?.includes('/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
      console.log('[API] Attempting token refresh');
      originalRequest._retry = true;

      try {
        await AuthService.refreshToken();
        const tokenData = storage.getToken();
        
        if (tokenData?.token) {
          console.log('[API] Token refreshed successfully');
          originalRequest.headers.Authorization = `Bearer ${tokenData.token}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        console.log('[API] Refresh token failed:', refreshError);
        storage.removeToken(); // Просто удаляем токен без перезагрузки
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
); 