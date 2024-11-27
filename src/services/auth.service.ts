import { API } from './api';
import { storage } from '@/utils/storage';

interface AuthResponse {
	token: string;
	result: {
		id: string;
		email: string;
		name: string;
    address: string;
    avatar_url: string;
	};
}

export const AuthService = {
  async signIn(email: string, password: string) {
    const { data } = await API.post<AuthResponse>('/user/signin', { email, password });
    
    // Преобразуем структуру данных в ожидаемый формат
    const tokenData = {
      token: data.token,
      user: data.result
    };
    
    storage.setToken(tokenData);
    return tokenData;
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
  }
}; 