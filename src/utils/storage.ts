interface TokenData {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    address: string;
    avatar_url: string;
  };
}

export const storage = {
  getToken(): TokenData | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      // Если данные уже в формате объекта, возвращаем их
      if (typeof token === 'object') {
        return token as TokenData;
      }

      // Пробуем распарсить строку
      const data = JSON.parse(token);
      console.log(data)
      // Проверяем структуру данных
      if (data && typeof data === 'object') {
        if (data.token && data.user) {
            console.log('123')
          return data as TokenData;
        }
        // Если данные в другом формате, пробуем адаптировать их
        if (data.accessToken) {
          return {
            token: data.accessToken,
            user: data.user
          } as TokenData;
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  },

  setToken(data: TokenData): void {
    if (typeof window === 'undefined') return;
    try {
      const tokenData = {
        token: data.token,
        user: data.user
      };
      localStorage.setItem('token', JSON.stringify(tokenData));
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },

  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
  }
}; 