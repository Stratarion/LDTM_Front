'use client'

import { useState, useRef } from 'react'
import { User } from '@/types/user'
import { UsersService } from '@/services/users.service'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, Camera } from 'lucide-react'
import Image from 'next/image'
import ConfirmModal from '@/components/shared/ConfirmModal'
import { AuthService } from '@/services/auth.service'

// Функция для форматирования телефонного номера
const formatPhoneNumber = (value: string) => {
  // Убираем все нецифровые символы
  const phoneNumber = value.replace(/\D/g, '')
  
  // Форматируем номер
  if (phoneNumber.length === 0) {
    return ''
  }
  if (phoneNumber.length <= 1) {
    return `+${phoneNumber}`
  }
  if (phoneNumber.length <= 4) {
    return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1)}`
  }
  if (phoneNumber.length <= 7) {
    return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4)}`
  }
  if (phoneNumber.length <= 9) {
    return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7)}`
  }
  return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 9)}-${phoneNumber.slice(9, 11)}`
}

// Функция для проверки валидности номера
const isValidPhoneNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, '')
  return digits.length === 11 && /^[1-9][0-9]*$/.test(digits)
}

interface PersonalDataProps {
  user: User
}

export default function PersonalData({ user }: PersonalDataProps) {
  const { login, refreshUserData, isLoading: isAuthLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [error, setError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    phone: formatPhoneNumber(user?.phone || '')
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === 'phone') {
      // Обработка ввода телефона
      const formattedPhone = formatPhoneNumber(value)
      setFormData(prev => ({
        ...prev,
        [name]: formattedPhone
      }))
      
      // Валидация телефона
      if (value && !isValidPhoneNumber(formattedPhone)) {
        setPhoneError('Введите корректный номер телефона')
      } else {
        setPhoneError('')
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Разрешаем: цифры, backspace, delete, tab, стрелки
    if (
      !/^\d$/.test(e.key) && 
      !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)
    ) {
      e.preventDefault()
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, загрузите изображение')
      return
    }

    // Проверяем размер файла (например, не более 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB')
      return
    }

    // Создаем превью файла
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setSelectedFile(file)
    setIsConfirmModalOpen(true)
  }

  const handleConfirmAvatarChange = async () => {
    if (!selectedFile) return
    setIsUploadingAvatar(true)
    setError('')

    try {
      await AuthService.uploadAvatar(user.id, selectedFile)
      await refreshUserData(user.id) // Обновляем данные после загрузки аватара
      setAvatarPreview('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при загрузке аватара')
    } finally {
      setIsUploadingAvatar(false)
      setSelectedFile(null)
      setIsConfirmModalOpen(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      setError('Имя и email ��бязательны для заполнения');
      return;
    }

    if (formData.phone && !isValidPhoneNumber(formData.phone)) {
      setError('Введите корректный номер телефона');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await UsersService.updateUser(user.id, {
        name: formData.name,
        email: formData.email,
        address: formData.address || undefined,
        phone: formData.phone ? formData.phone.replace(/\D/g, '') : undefined
      });
      
      await refreshUserData(user.id); // Обновляем данные с сервера
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Произошла ошибка при обновлении данных');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      address: user?.address || '',
      phone: formatPhoneNumber(user?.phone || '')
    })
    setError('')
  }

  const handleUpgradeToCommercial = async () => {
    setIsLoading(true)
    try {
      await UsersService.updateUser(user.id, {
        ...formData,
        userType: 'provider',
        isOrganisation: true,
      })
      await refreshUserData(user.id)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при обновлении типа аккаунта')
    } finally {
      setIsLoading(false)
    }
  }

  // Показываем индикатор загрузки при инициализации
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#5CD2C6]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-center">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            ) : user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt="Avatar"
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#5CD2C6] text-white text-4xl font-medium">
                {user.name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          
          <button
            onClick={handleAvatarClick}
            disabled={isUploadingAvatar || !isEditing}
            className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity rounded-full ${
              isEditing ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'
            }`}
          >
            {isUploadingAvatar ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Camera className="w-6 h-6 text-white" />
            )}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            disabled={!isEditing}
            className="hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Имя *
          </label>
          <input
            type="text"
            name="name"
            disabled={!isEditing || isSubmitting}
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            disabled={!isEditing || isSubmitting}
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Телефон
          </label>
          <div className="relative">
            <input
              type="tel"
              name="phone"
              disabled={!isEditing || isSubmitting}
              value={formData.phone}
              onChange={handleChange}
              onKeyDown={handlePhoneKeyDown}
              placeholder="+7 (999) 999-99-99"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900 disabled:bg-gray-50 disabled:text-gray-500 ${
                phoneError ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {phoneError && (
              <p className="absolute -bottom-5 left-0 text-xs text-red-500">
                {phoneError}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Адрес
          </label>
          <input
            type="text"
            name="address"
            disabled={!isEditing || isSubmitting}
            value={formData.address}
            onChange={handleChange}
            placeholder="Город, улица, дом"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        {isEditing ? (
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#5CD2C6] text-white rounded-lg hover:bg-[#4BC0B5] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Сохранить
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-[#5CD2C6] text-white rounded-lg hover:bg-[#4BC0B5] transition-colors"
          >
            Редактировать
          </button>
        )}
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false)
          setSelectedFile(null)
          setAvatarPreview('')
        }}
        onConfirm={handleConfirmAvatarChange}
        title="Сменить аватар?"
        message="Вы уверены, что хотите сменить аватар профиля?"
      />

      {user.userType === 'user' && (
        <div className="border-t pt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              Коммерческий аккаунт
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Получите доступ к расширенным возможностям для организаций и поставщиков услуг
            </p>
            <button
              onClick={handleUpgradeToCommercial}
              disabled={isLoading}
              className="w-full bg-[#5CD2C6] text-white py-2 rounded-lg hover:bg-[#4BC0B5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Обновление...
                </>
              ) : (
                'Перевести в коммерческий аккаунт'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 