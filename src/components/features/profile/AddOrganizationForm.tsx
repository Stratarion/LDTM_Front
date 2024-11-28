'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Upload, Image as ImageIcon } from 'lucide-react'
import { OrganizationsService } from '@/services/organizations.service'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'

interface AddOrganizationFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type OrganizationType = 'school' | 'garden'

export default function AddOrganizationForm({
  isOpen,
  onClose,
  onSuccess
}: AddOrganizationFormProps) {
  const { user } = useAuth()
  const [organizationType, setOrganizationType] = useState<OrganizationType>('school')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    email: '',
    phone: '',
    director_name: '',
    schoolType: 'state' as 'state' | 'private',
    maxCount: '',
    approach: '',
    costInfo: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + selectedImages.length > 5) {
      setError('Максимальное количество фотографий - 5')
      return
    }

    // Проверяем размер и тип файлов
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Пожалуйста, загружайте только изображения')
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Размер каждого файла не должен превышать 5MB')
        return false
      }
      return true
    })

    setSelectedImages(prev => [...prev, ...validFiles])

    // Создаем URL для предпросмотра
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => {
      // Освобождаем URL
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.address || !formData.email || !formData.phone || !formData.director_name) {
      setError('Заполните все обязательные поля')
      return
    }

    if (!user) {
      setError('Необходимо авторизоваться')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const formDataToSend = new FormData()
      
      // Добавляем основные данные
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '') {
          formDataToSend.append(key, value)
        }
      })
      
      // Добавляем тип организации и ID пользователя
      formDataToSend.append('type', organizationType)
      formDataToSend.append('owner_id', user.id)
      formDataToSend.append('creater_id', user.id)

      // Добавляем изображения
      selectedImages.forEach((file) => {
        formDataToSend.append(`images`, file)
      })

      await OrganizationsService.createOrganization(formDataToSend)
      onSuccess()
      
      // Очищаем предпросмотр
      previewUrls.forEach(url => URL.revokeObjectURL(url))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Произошла ошибка при создании организации')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

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
          className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Добавить организацию
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Переключатель типа организации */}
            <div className="flex justify-center bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setOrganizationType('school')}
                className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                  organizationType === 'school'
                    ? 'bg-white text-[#5CD2C6] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Школа
              </button>
              <button
                type="button"
                onClick={() => setOrganizationType('garden')}
                className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                  organizationType === 'garden'
                    ? 'bg-white text-[#5CD2C6] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Детский сад
              </button>
            </div>

            {/* Загрузка изображений */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Фотографии (до 5 шт.)
              </label>
              <div className="grid grid-cols-5 gap-4 mb-4">
                {previewUrls.map((url, index) => (
                  <div key={url} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        width={200}
                        height={200}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {selectedImages.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-[#5CD2C6] transition-colors"
                  >
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-sm text-gray-500">Добавить</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Адрес *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип организации
              </label>
              <select
                name="schoolType"
                value={formData.schoolType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
              >
                <option value="state">Государственная</option>
                <option value="private">Частная</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+7 (999) 999-99-99"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ФИО директора *
              </label>
              <input
                type="text"
                name="director_name"
                value={formData.director_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Максимальное количество учеников
                </label>
                <input
                  type="number"
                  name="maxCount"
                  value={formData.maxCount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                />
              </div>

              {formData.schoolType === 'private' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Стоимость (₽/месяц)
                  </label>
                  <input
                    type="number"
                    name="costInfo"
                    value={formData.costInfo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Подход к обучению
              </label>
              <input
                type="text"
                name="approach"
                value={formData.approach}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-[#5CD2C6] text-white rounded-lg hover:bg-[#4BC0B5] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Создать
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 