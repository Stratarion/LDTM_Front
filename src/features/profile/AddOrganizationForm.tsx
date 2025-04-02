'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Upload, Star, Trash } from 'lucide-react'
import { OrganizationsService } from '@/services/organizations.service'
import Image from 'next/image'
import { useAuth } from '@/shared/lib/hooks/useAuth'
import { validateImage, resizeImage } from '@/shared/lib/utils/image'
import { OrganizationType, OrganizationStatus } from '@/types/organization'
import { ConfirmModal } from '@/shared/ui/confirmModal'
import { useNotifications } from '@/shared/lib/hooks/useNotifications'

interface AddOrganizationFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  name: string
  description: string
  address: string
  email: string
  phone: string
  website: string
  director_name: string
  school_type: 'state' | 'private'
  max_count: number
  approach: string
  cost_info: number
  type: OrganizationType
  status: OrganizationStatus
}

export default function AddOrganizationForm({
  isOpen,
  onClose,
  onSuccess
}: AddOrganizationFormProps) {
  const { user } = useAuth()
  const [organizationType, setOrganizationType] = useState<OrganizationType>('school')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    address: '',
    email: '',
    phone: '',
    website: '',
    director_name: '',
    school_type: 'state',
    max_count: 0,
    approach: '',
    cost_info: 0,
    type: 'school',
    status: 'pending'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [photos, setPhotos] = useState<{ file: File; preview: string; description?: string }[]>([])
  const [isConfirmPhotoDeleteOpen, setIsConfirmPhotoDeleteOpen] = useState(false)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const { showNotification } = useNotifications()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalPhotos = photos.length + files.length
    
    if (totalPhotos > 5) {
      showNotification({
        title: 'Ошибка',
        message: 'Максимальное количество фотографий - 5',
        type: 'error'
      })
      return
    }

    try {
      const newPhotos = await Promise.all(
        files.map(async (file) => {
          validateImage(file)
          const preview = URL.createObjectURL(file)
          return {
            file,
            preview,
            description: photos.length === 0 && files[0] === file ? 'main' : undefined
          }
        })
      )

      setPhotos(prev => [...prev, ...newPhotos])
    } catch (err: any) {
      showNotification({
        title: 'Ошибка',
        message: err.message,
        type: 'error'
      })
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePhotoDelete = (index: number) => {
    setSelectedPhotoIndex(index)
    setIsConfirmPhotoDeleteOpen(true)
  }

  const confirmPhotoDelete = () => {
    if (selectedPhotoIndex === null) return
    
    const newPhotos = [...photos]
    URL.revokeObjectURL(newPhotos[selectedPhotoIndex].preview)
    
    // Если удаляем главное фото, делаем главным следующее
    if (newPhotos[selectedPhotoIndex].description === 'main' && newPhotos.length > 1) {
      const nextIndex = selectedPhotoIndex === newPhotos.length - 1 ? 0 : selectedPhotoIndex + 1
      newPhotos[nextIndex].description = 'main'
    }
    
    newPhotos.splice(selectedPhotoIndex, 1)
    setPhotos(newPhotos)
    setSelectedPhotoIndex(null)
    setIsConfirmPhotoDeleteOpen(false)
  }

  const handleSetMainPhoto = (index: number) => {
    setPhotos(photos.map((photo, i) => ({
      ...photo,
      description: i === index ? 'main' : undefined
    })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setIsLoading(true)
    setError('')

    try {
      // Подготавливаем фотографии
      const processedPhotos = await Promise.all(
        photos.map(async (photo) => {
          const resizedImage = await resizeImage(photo.file)
          const base64Data = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(resizedImage)
          })
          return {
            base64Data,
            description: photo.description
          }
        })
      )

      const data = {
        ...formData,
        owner_id: user.id,
        creater_id: user.id,
        photos: processedPhotos
      }

      await OrganizationsService.createOrganization(data)
      onSuccess()
      
      // Очищаем URL превью
      photos.forEach(photo => URL.revokeObjectURL(photo.preview))
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при создании организации')
    } finally {
      setIsLoading(false)
    }
  }

  // Очистка URL при размонтировании
  useEffect(() => {
    return () => {
      photos.forEach(photo => URL.revokeObjectURL(photo.preview))
    }
  }, [])

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
                Фотографии
              </label>
              <div className="grid grid-cols-5 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square relative rounded-lg overflow-hidden">
                      <Image
                        src={photo.preview}
                        alt={`Фото ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {photo.description === 'main' && (
                        <div className="absolute top-2 left-2 bg-yellow-400 text-white p-1 rounded-full">
                          <Star className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {photo.description !== 'main' && (
                        <button
                          type="button"
                          onClick={() => handleSetMainPhoto(index)}
                          className="p-1 bg-yellow-400 text-white rounded-full hover:bg-yellow-500"
                          title="Сделать главным"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handlePhotoDelete(index)}
                        className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        title="Удалить"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {photos.length < 5 && (
                  <div className="aspect-square relative border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center text-gray-600 hover:text-gray-900"
                    >
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="text-sm">Добавить фото</span>
                    </button>
                  </div>
                )}
              </div>
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
                name="school_type"
                value={formData.school_type}
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
                  name="max_count"
                  value={formData.max_count}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                />
              </div>

              {formData.school_type === 'private' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Стоимость (₽/месяц)
                  </label>
                  <input
                    type="number"
                    name="cost_info"
                    value={formData.cost_info}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Веб-сайт
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
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

          <ConfirmModal
            isOpen={isConfirmPhotoDeleteOpen}
            onClose={() => {
              setIsConfirmPhotoDeleteOpen(false)
              setSelectedPhotoIndex(null)
            }}
            onConfirm={confirmPhotoDelete}
            title="Удаление фото"
            message="Вы уверены, что хотите удалить это фото?"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 