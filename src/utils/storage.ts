interface TokenData {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: any;
  timestamp?: number;
}

export const storage = {
  setToken(data: TokenData) {
    if (typeof window === 'undefined') return;
    
    const tokenData = {
      ...data,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem('token', JSON.stringify(tokenData));
      window.dispatchEvent(new Event('localStorageChange'));
    } catch (error) {
      console.error('Error saving token:', error);
    }
  },

  getToken(): TokenData | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const data = localStorage.getItem('token');
      if (!data) return null;

      const tokenData = JSON.parse(data) as TokenData;
      return tokenData;
    } catch (error) {
      this.removeToken();
      return null;
    }
  },

  removeToken() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('localStorageChange'));
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }
}; 