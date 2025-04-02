import { useState, useEffect } from 'react'
import { User } from '@/shared/types/user'
import { storage } from '@/shared/lib/utils/storage'
import { AuthService } from '@/services/auth.service'
import { UsersService } from '@/services/users.service'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initAuth = () => {
      const { user } = storage.getAuthData()
      setUser(user)
      setIsInitialized(true)
      setIsLoading(false)
    }

    initAuth()
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      if (!isInitialized) return

      try {
        const { user } = storage.getAuthData()
        if (user?.id) {
          const userData = await UsersService.getCurrentUser(user.id)
          setUser(userData)
          storage.setUserData(userData)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        storage.clearAuth()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [isInitialized])

  useEffect(() => {
    if (!isInitialized) return

    const handleStorageChange = () => {
      const { user } = storage.getAuthData()
      setUser(user)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('localStorageChange', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorageChange', handleStorageChange)
    }
  }, [isInitialized])

  const login = (userData: User) => {
    setUser(userData)
    storage.setUserData(userData)
    setIsLoading(false)
  }

  const logout = async () => {
    try {
      await AuthService.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      storage.clearAuth()
      setIsLoading(false)
    }
  }

  const refreshUserData = async () => {
    if (!user?.id) return null
    
    try {
      const userData = await UsersService.getCurrentUser(user.id)
      setUser(userData)
      storage.setUserData(userData)
      return userData
    } catch (error) {
      console.error('Error refreshing user data:', error)
      return null
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (!user) return

    const updatedUser = { ...user, ...userData }
    setUser(updatedUser)
    storage.setUserData(updatedUser)
  }

  return {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user && isInitialized,
    refreshUserData,
    updateUser
  }
} 