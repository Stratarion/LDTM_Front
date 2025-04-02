'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { AuthService } from '@/services/auth.service'
import RegisterModal from './RegisterModal'
import { useAuth } from '@/shared/lib/hooks/useAuth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoginView, setIsLoginView] = useState(true)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const data = await AuthService.signIn(email, password)
      
      // AuthService уже сохранил данные в storage
      login(data.result)
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Произошла ошибка при входе')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence mode="wait">
      {isLoginView ? (
        <motion.div
          key="login-modal"
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

            <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Войти в EduKids</h2>

            {/* Форма входа */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Электронная почта"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Пароль"
                  className="w-full pl-10 pr-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6]"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#5CD2C6] text-white py-2 rounded-lg hover:bg-[#4BC0B5] transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Загрузка...' : 'Продолжить'}
              </button>
            </form>

            {/* Разделитель */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">или войти через</span>
              </div>
            </div>

            {/* Кнопки соц. сетей */}
            <div className="space-y-4 mb-6">
              <button
                onClick={() => console.log('VK login')}
                className="w-full flex items-center justify-center gap-3 bg-[#0077FF] text-white py-3 rounded-lg hover:bg-[#0066CC] transition-colors"
              >
                <Image 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@v3/icons/vk.svg" 
                  alt="VK" 
                  width={24} 
                  height={24} 
                  className="brightness-0 invert"
                />
                Войти через ВКонтакте
              </button>

              <button
                onClick={() => console.log('Google login')}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                <Image 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@v3/icons/google.svg" 
                  alt="Google" 
                  width={24} 
                  height={24} 
                  className="invert-[.4]"
                />
                Войти через Google
              </button>

              <button
                onClick={() => console.log('Yandex login')}
                className="w-full flex items-center justify-center gap-3 bg-[#FC3F1D] text-white py-3 rounded-lg hover:bg-[#E63611] transition-colors"
              >
                <Image 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@v3/icons/yandex.svg" 
                  alt="Yandex" 
                  width={24} 
                  height={24} 
                  className="brightness-0 invert"
                />
                Войти через Яндекс
              </button>
            </div>

            {/* Кнопка регистрации */}
            <div className="text-center">
              <p className="text-gray-600 mb-2">Ещё нет аккаунта?</p>
              <button
                onClick={() => setIsLoginView(false)}
                className="text-[#5CD2C6] hover:text-[#4BC0B5] font-medium"
              >
                Зарегистрироваться
              </button>
            </div>

            <p className="text-sm text-gray-500 text-center mt-6">
              Продолжая, вы соглашаетесь с нашими Условиями использования и Политикой конфиденциальности
            </p>
          </motion.div>
        </motion.div>
      ) : (
        <RegisterModal
          key="register-modal"
          isOpen={isOpen}
          onClose={onClose}
          onBackToLogin={() => setIsLoginView(true)}
        />
      )}
    </AnimatePresence>
  )
} 