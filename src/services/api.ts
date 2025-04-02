import axios from 'axios';
import { storage } from '@/shared/lib/utils/storage';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Переименовываем в API для обратной совместимости
export const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Интерцептор для добавления токена к запросам
API.interceptors.request.use(
  (config) => {
    const tokenData = storage.getTokenData()
    if (tokenData?.token) {
      config.headers.Authorization = `Bearer ${tokenData.token}`
    }
    return config;
  },
  (error) => {
    return Promise.reject(error)
  }
);

// Интерцептор для обработки ответов
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await API.post('/auth/refresh');
        const { token } = response.data;

        localStorage.setItem('token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return API(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    if (!error.response) {
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your internet connection.'
      });
    }

    const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
    return Promise.reject({
      ...error,
      message: errorMessage
    });
  }
);

// Типы для запросов
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

// Типизированные методы API
export const apiService = {
  get: async <T>(url: string, config = {}) => {
    const response = await API.get<ApiResponse<T>>(url, config);
    return response.data;
  },

  post: async <T>(url: string, data = {}, config = {}) => {
    const response = await API.post<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  put: async <T>(url: string, data = {}, config = {}) => {
    const response = await API.put<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  delete: async <T>(url: string, config = {}) => {
    const response = await API.delete<ApiResponse<T>>(url, config);
    return response.data;
  },

  patch: async <T>(url: string, data = {}, config = {}) => {
    const response = await API.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }
};

// Экспортируем все как по умолчанию
export default {
  API,
  apiService
}; 