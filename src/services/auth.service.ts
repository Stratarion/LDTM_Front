import { API } from './api';
import { storage } from '@/utils/storage';

interface AuthResponse {
	token: string;
	refreshToken: string;
	expiresIn: number;
	result: {
		id: string;
		email: string;
		name: string;
    address: string;
    avatar_url: string;
	};
}

// Добавляем интерфейс для данных регистрации
interface RegisterData {
  email: string;
  password: string;
  name: string;
  title?: string;
  address?: string;
  phone?: string;
  isOrganisation: boolean;
  avatar_url?: string;
  userType: string;
}

export const AuthService = {
  async signIn(email: string, password: string) {
    const { data } = await API.post<AuthResponse>('/user/signin', { email, password });
    
    const expiresIn = Number(data.expiresIn) || 3600;

    const tokenData = {
      token: data.token,
      refreshToken: data.refreshToken,
      expiresIn,
      user: data.result
    };

    storage.setToken(tokenData);
    this.startTokenRefreshTimer(expiresIn);
    return tokenData;
  },

  async refreshToken() {
    try {
      const currentToken = storage.getToken();
      if (!currentToken?.refreshToken) throw new Error('No refresh token');

      const { data } = await API.post<AuthResponse>('/user/refresh', {
        refreshToken: currentToken.refreshToken
      });

      const tokenData = {
        token: data.token,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
        user: data.result
      };

      storage.setToken(tokenData);
      this.startTokenRefreshTimer(data.expiresIn);
      return tokenData;
    } catch (error) {
      this.logout();
      throw error;
    }
  },

  startTokenRefreshTimer(expiresIn: number) {
    const refreshTime = (expiresIn - 60) * 1000;
    setTimeout(() => this.refreshToken(), refreshTime);
  },

  logout() {
    storage.removeToken();
    window.location.href = '/';
  },

  getUser() {
    const token = storage.getToken();
    return token?.user || null;
  },

  isAuthenticated() {
    const token = storage.getToken();
    return !!token?.token && !!token?.user;
  },

  async signUp(data: RegisterData) {
    const { data: response } = await API.post<AuthResponse>('/user/signup', data);
    
    const tokenData = {
      token: response.token,
      refreshToken: response.refreshToken,
      expiresIn: response.expiresIn,
      user: response.result
    };
    
    storage.setToken(tokenData);
    this.startTokenRefreshTimer(response.expiresIn);
    return tokenData;
  },

  async uploadAvatar(userId: string, file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    const { data } = await API.post<{ avatar_url: string }>(
      `/user/avatar?id=${userId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return data.avatar_url;
  },
}; 