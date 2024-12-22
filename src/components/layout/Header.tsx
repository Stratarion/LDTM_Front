'use client'

import { Bell, Settings, LogIn } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import AuthModal from '../features/AuthModal'
import UserProfileModal from '../features/UserProfileModal'
import { usePathname } from 'next/navigation'
import NotificationsPopover from '../features/NotificationsPopover'
import { useAuth } from '@/hooks/useAuth'

export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

  const handleAvatarClick = () => {
    setIsProfileModalOpen(true)
  }

  return (
    <>
      <header className="h-20 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#5CD2C6]">
            EduKids
          </Link>
          
          <div className="flex items-center gap-4">
            {!isLoading && user ? (
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
                <div className="relative">
                  <button
                    onClick={handleAvatarClick}
                    className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-[#5CD2C6] transition-all"
                  >
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#5CD2C6] text-white text-xl">
                        {user.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </button>
                </div>
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
        onClose={() => setIsAuthModalOpen(false)} 
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  )
} 