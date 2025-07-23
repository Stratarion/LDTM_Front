import { ITokenData } from '@/entities/user/model/ITokenData'
import { User } from '@/entities/user/model/user'



export const storage = {
  setTokenData(data: ITokenData) {
    if (typeof window === 'undefined') return
    
    const tokenData = {
      ...data,
      timestamp: Date.now()
    }

    try {
      localStorage.setItem('token', JSON.stringify(tokenData))
      window.dispatchEvent(new Event('localStorageChange'))
    } catch (error) {
      console.error('Error saving token:', error)
    }
  },

  setUserData(user: User) {
    if (typeof window === 'undefined' || !user) return
    try {
      localStorage.setItem('user', JSON.stringify(user))
      window.dispatchEvent(new Event('localStorageChange'))
    } catch (error) {
      console.error('Error saving user:', error)
    }
  },

  getTokenData(): ITokenData | null {
    if (typeof window === 'undefined') return null
    
    try {
      const data = localStorage.getItem('token')
      if (!data) return null
      return JSON.parse(data) as ITokenData
    } catch (error) {
      this.removeTokenData()
      console.error(error)
      return null
    }
  },

  getUserData(): User | null {
    if (typeof window === 'undefined') return null

    try {
      const data = localStorage.getItem('user')
      if (!data) return null
      return JSON.parse(data) as User
    } catch (error) {
      this.removeUserData()
      console.error(error)
      return null
    }
  },

  setAuthData(data: { token: string; refreshToken: string; expiresIn: number; user: User }) {
    this.setTokenData({
      token: data.token,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      timestamp: Date.now()
    })
    this.setUserData(data.user)
  },

  getAuthData(): { token: ITokenData | null; user: User | null } {
    return {
      token: this.getTokenData(),
      user: this.getUserData()
    }
  },

  removeTokenData() {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem('token')
      window.dispatchEvent(new Event('localStorageChange'))
    } catch (error) {
      console.error('Error removing token:', error)
    }
  },

  removeUserData() {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem('user')
      window.dispatchEvent(new Event('localStorageChange'))
    } catch (error) {
      console.error('Error removing user:', error)
    }
  },

  clearAuth() {
    this.removeTokenData()
    this.removeUserData()
  },

  isTokenExpired(): boolean {
    const tokenData = this.getTokenData()
    if (!tokenData) return true

    const expirationTime = tokenData.timestamp + tokenData.expiresIn * 1000
    return Date.now() >= expirationTime
  }
}
