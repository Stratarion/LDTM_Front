'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Phone, MapPin, Building, Upload } from 'lucide-react'
import { useState, useCallback } from 'react'
import { AuthService } from '@/services/auth.service'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onBackToLogin: () => void
}

export default function RegisterModal({ isOpen, onClose, onBackToLogin }: RegisterModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    title: '',
    address: '',
    phone: '',
    isOrganisation: false,
    avatar_url: '',
    userType: 'user', // Оставляем только это значение по умолчанию
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')

  // Функция для форматирования телефонного номера
  const formatPhoneNumber = (value: string) => {
    // Убираем все нецифровые символы
    const numbers = value.replace(/\D/g, '')
    
    // Ограничиваем длину до 11 цифр
    const trimmed = numbers.substring(0, 11)
    
    // Форматируем номер
    let formatted = ''
    if (trimmed.length > 0) {
      // Добавляем +7
      formatted = '+7'
      if (trimmed.length > 1) {
        formatted += ` (${trimmed.substring(1, 4)}`
      }
      if (trimmed.length > 4) {
        formatted += `) ${trimmed.substring(4, 7)}`
      }
      if (trimmed.length > 7) {
        formatted += `-${trimmed.substring(7, 9)}`
      }
      if (trimmed.length > 9) {
        formatted += `-${trimmed.substring(9, 11)}`
      }
    }
    return formatted
  }

  // Обновляем handleChange для особой обработки телефона
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    
    if (name === 'phone') {
      // Для телефона применяем форматирование
      setFormData(prev => ({
        ...prev,
        [name]: formatPhoneNumber(value)
      }))
    } else {
      // Для остальных полей оставляем как есть
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }))
    }
  }, [])

  // Валидация формы перед отправкой
  const validateForm = () => {
    // Проверяем формат телефона
    if (formData.phone) {
      const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/
      if (!phoneRegex.test(formData.phone)) {
        setError('Неверный формат номера телефона')
        return false
      }
    }
    return true
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      // Создаем превью файла
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Обновляем handleSubmit для включения валидации
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Регистрируем пользователя
      const userData = await AuthService.signUp(formData)
      
      // Если есть файл аватарки, загружаем его
      if (avatarFile && userData.user.id) {
        try {
          const avatarUrl = await AuthService.uploadAvatar(userData.user.id, avatarFile)
          // Обновляем данные пользователя с новым аватаром
          userData.user.avatar_url = avatarUrl
        } catch (avatarError) {
          console.error('Ошибка при загрузке аватара:', avatarError)
          // Не прерываем регистрацию, если загрузка аватара не удалась
        }
      }

      onClose()
      window.location.reload()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при регистрации')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      key="register-modal"
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
        className="bg-white rounded-2xl p-8 w-full max-w-md relative overflow-y-auto max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">Регистрация в EduKids</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#5CD2C6] flex items-center justify-center bg-gray-100">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-[#5CD2C6] rounded-full p-2 cursor-pointer hover:bg-[#4BC0B5] transition-colors">
                <Upload className="w-4 h-4 text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Электронная почта"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Пароль"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
              required
            />
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Имя"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
              required
            />
          </div>

          {formData.isOrganisation && (
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Название организации"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
              />
            </div>
          )}

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Адрес"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+7 (___) ___-__-__"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
              maxLength={18} // Максимальная длина с учетом форматирования
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isOrganisation"
              checked={formData.isOrganisation}
              onChange={handleChange}
              className="rounded border-gray-300 text-[#5CD2C6] focus:ring-[#5CD2C6]"
            />
            <label className="text-sm text-gray-600">Коммерческий аккаунт</label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#5CD2C6] text-white py-2 rounded-lg hover:bg-[#4BC0B5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={onBackToLogin}
            className="text-[#5CD2C6] hover:text-[#4BC0B5] font-medium"
          >
            Уже есть аккаунт? Войти
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
} 