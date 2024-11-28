import { useState, useEffect } from 'react'
import { User } from '@/types/user'

interface AuthData {
  token: string
  user: User
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const authData = localStorage.getItem('token')
    if (authData) {
      const parsedData = JSON.parse(authData) as AuthData
      setUser(parsedData.user)
    }
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return {
    user,
    login,
    logout,
    isAuthenticated: !!user
  }
} 