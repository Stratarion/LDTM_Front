'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, User, LogOut } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { User as UserType } from '@/types/user'
import { useAuth } from '@/hooks/useAuth'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

const roleLabels: Record<UserType['userType'], string> = {
  admin: 'Администратор',
  user: 'Пользователь',
  provider: 'Представитель организации'
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()

  const handleLogout = () => {
    logout()
    onClose()
  }

  const handleProfileClick = () => {
    router.push('/profile')
    onClose()
  }

  if (!isOpen || isLoading) return null
  if (!user) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl p-8 w-full max-w-md relative"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>

          <div className="flex flex-col items-center">
            <div className="h-24 w-24 rounded-full overflow-hidden mb-4">
              <Image
                src={user?.avatar || "https://picsum.photos/200"}
                alt="Profile"
                width={96}
                height={96}
                className="object-cover"
              />
            </div>

            <h2 className="text-2xl font-bold mb-1">{user?.first_name || 'Пользователь'}</h2>
            <p className="text-gray-600 mb-2">{user?.email}</p>
            <p className="text-sm text-gray-500 mb-6">
              {user?.userType ? roleLabels[user.userType] : ''}
            </p>

            <div className="w-full space-y-3">
              <button
                onClick={handleProfileClick}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                <User size={20} />
                Личный кабинет
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-red-600"
              >
                <LogOut size={20} />
                Выйти из аккаунта
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 