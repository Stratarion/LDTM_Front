'use client'

import { Bell, Settings, LogIn } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import AuthModal from '../features/AuthModal'
import UserProfileModal from '../features/UserProfileModal'
import { usePathname } from 'next/navigation'
import { storage } from '@/utils/storage'
import NotificationsPopover from '../features/NotificationsPopover'

export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const pathname = usePathname()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  // Функция для проверки авторизации
  const checkAuth = () => {
    const tokenData = storage.getToken();
    if (tokenData?.token && tokenData?.user) {
      setUserData(tokenData.user);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      setUserData(null);
    }
  }

  // Проверяем авторизацию при монтировании и изменении pathname
  useEffect(() => {
    checkAuth()
  }, [pathname])

  // Добавляем слушатель события storage для синхронизации между вкладками
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <>
      <header className="h-20 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#5CD2C6]">
            EduKids
          </Link>
          
          <div className="flex items-center gap-4">
            {isLoggedIn && userData ? (
              <>
                <div className="relative">
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-full relative"
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  <NotificationsPopover 
                    isOpen={isNotificationsOpen}
                    onClose={() => setIsNotificationsOpen(false)}
                  />
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
                <button 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="h-10 w-10 rounded-full overflow-hidden hover:ring-2 hover:ring-[#5CD2C6] transition-all"
                >
                  <Image
                    src="https://picsum.photos/200"
                    alt="Профиль"
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5CD2C6] text-white hover:bg-[#4BC0B5] transition-colors"
              >
                <LogIn size={20} />
                Войти
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          setIsAuthModalOpen(false)
          checkAuth() // Проверяем авторизацию после закрытия модального окна
        }} 
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false)
          checkAuth() // Проверяем авторизацию после закрытия модального окна профиля
        }}
      />
    </>
  )
} 