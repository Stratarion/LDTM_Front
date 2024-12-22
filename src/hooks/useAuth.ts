import { useState, useEffect } from 'react'
import { User } from '@/types/user'
import { storage } from '@/utils/storage'
import { AuthService } from '@/services/auth.service'
import { UsersService } from '@/services/users.service'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleStorageChange = () => {
      const tokenData = storage.getToken()
      if (tokenData?.user) {
        setUser(tokenData.user)
      } else {
        setUser(null)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('localStorageChange', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorageChange', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      const tokenData = storage.getToken()

      if (tokenData?.user?.id) {
        try {
          // Сначала устанавливаем данные из storage для быстрого отображения
          setUser(tokenData.user)
          
          // Затем запрашиваем актуальные данные с сервера
          const userData = await UsersService.getCurrentUser(tokenData.user.id)
          
          // Обновляем данные пользователя в storage и state
          storage.setToken({
            ...tokenData,
            user: userData
          })
          setUser(userData)
        } catch (error) {
          setUser(null)
          storage.removeToken()
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    AuthService.logout()
    setIsLoading(false)
  }

  const refreshUserData = async (userId: number) => {
    try {
      const userData = await UsersService.getCurrentUser(userId)
      
      // Обновляем данные в storage и state
      const tokenData = storage.getToken()
      if (tokenData) {
        storage.setToken({
          ...tokenData,
          user: userData
        })
      }
      
      setUser(userData)
      return userData
    } catch (error) {
      console.error('Error refreshing user data:', error)
      throw error
    }
  }

  return {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    refreshUserData
  }
} 