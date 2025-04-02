'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Star, Dumbbell, Brain, Upload, X as XIcon } from 'lucide-react'
import { ServicesService } from '@/services/services.service'
import { useAuth } from '@/shared/lib/hooks/useAuth'
import { PhotosService } from '@/services/photos.service'
import { validateImage, resizeImage } from '@/shared/lib/utils/image'
import Image from 'next/image'
import { ConfirmModal } from '@/shared/ui/confirmModal'
import { useNotifications } from '@/shared/lib/hooks/useNotifications'
import AddressAutocomplete from '@/features/AddressAutocomplete'

interface AddServiceFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialType: 'sport' | 'development'
}

interface FormData {
  name: string
  description: string
  category: 'sport' | 'development'
  price: string
  max_students: string
  age_from: string
  age_to: string
  address: string
  country: string
  coordinates: string | null
  duration: string
  email: string
  phone: string
  subcategory: string
}

interface PhotoData {
  file: File
  preview: string
  isMain?: boolean
}

export default function AddServiceForm({
  isOpen,
  onClose,
  onSuccess,
  initialType
}: AddServiceFormProps) {
  const { user } = useAuth()
  const { showNotification } = useNotifications()
  const [serviceType, setServiceType] = useState<'sport' | 'development'>(initialType)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    duration: '',
    category: serviceType,
    price: '',
    max_students: '',
    age_from: '',
    age_to: '',
    address: '',
    country: '',
    coordinates: null,
    email: user?.email || '',
    phone: '',
    subcategory: ''
  })
  const [photos, setPhotos] = useState<PhotoData[]>([])
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoToDelete, setPhotoToDelete] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddressChange = (address: {
    fullAddress: string
    country: string
    coordinates: string
  }) => {
    setFormData(prev => ({
      ...prev,
      address: address.fullAddress,
      country: address.country,
      coordinates: address.coordinates
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      // Validate required fields
      const requiredFields = ['name', 'price', 'address', 'age_from', 'age_to', 'phone']
      const missingFields = requiredFields.filter(field => !formData[field as keyof FormData])
      
      if (missingFields.length > 0) {
        setError('Пожалуйста, заполните все обязательные поля')
        return
      }

      // Create service
      const serviceData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        max_students: parseInt(formData.max_students),
        age_from: parseInt(formData.age_from),
        age_to: parseInt(formData.age_to),
        address: formData.address,
        country: formData.country,
        coordinates: formData.coordinates || undefined,
        duration: parseInt(formData.duration),
        email: formData.email,
        phone: formData.phone,
        subcategory: formData.subcategory,
        organisation_id: user.id,
        status: 'pending' as const
      }

      const response = await ServicesService.createService(serviceData)

      // Upload photos if any
      if (photos.length > 0) {
        await Promise.all(
          photos.map(async (photo, index) => {
            const resizedBlob = await resizeImage(photo.file)
            // Convert Blob to File
            const resizedFile = new File(
              [resizedBlob], 
              photo.file.name, 
              { 
                type: resizedBlob.type,
                lastModified: photo.file.lastModified
              }
            )
            await PhotosService.uploadPhoto(
              resizedFile,
              'service',
              response.id,
              user.id,
              index === mainPhotoIndex ? 'main' : undefined
            )
          })
        )
      }

      onSuccess()
      onClose()
      showNotification({
        title: 'Успех',
        message: 'Услуга успешно добавлена',
        type: 'success'
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Произошла ошибка при создании услуги')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    try {
      const newPhotos = await Promise.all(
        files.map(async (file) => {
          await validateImage(file)
          return {
            file,
            preview: URL.createObjectURL(file),
            isMain: photos.length === 0 // First photo is main by default
          }
        })
      )

      setPhotos(prev => [...prev, ...newPhotos])
      if (photos.length === 0) {
        setMainPhotoIndex(0)
      }
    } catch (error: any) {
      showNotification({
        title: 'Ошибка',
        message: error.message,
        type: 'error'
      })
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePhotoDelete = (index: number) => {
    setPhotoToDelete(index)
  }

  const confirmPhotoDelete = () => {
    if (photoToDelete === null) return
    
    const newPhotos = [...photos]
    URL.revokeObjectURL(newPhotos[photoToDelete].preview)

    // If deleting main photo, make next photo main
    if (photoToDelete === mainPhotoIndex) {
      const nextIndex = photoToDelete === newPhotos.length - 1 ? 0 : photoToDelete + 1
      setMainPhotoIndex(nextIndex)
    } else if (photoToDelete < mainPhotoIndex) {
      // Adjust mainPhotoIndex if deleting photo before it
      setMainPhotoIndex(mainPhotoIndex - 1)
    }

    newPhotos.splice(photoToDelete, 1)
    setPhotos(newPhotos)
    setPhotoToDelete(null)
  }

  useEffect(() => {
    return () => {
      photos.forEach(photo => URL.revokeObjectURL(photo.preview))
    }
  }, [])

  if (!isOpen) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed overflow-y-auto inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          key="modal-content"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto my-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Добавить услугу
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
            {/* Переключатель типа услуги */}
            <div className="flex justify-center bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setServiceType('sport')}
                className={`flex items-center gap-2 flex-1 px-4 py-2 rounded-md transition-colors ${
                  serviceType === 'sport'
                    ? 'bg-white text-[#5CD2C6] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Dumbbell className="w-5 h-5" />
                Спорт
              </button>
              <button
                type="button"
                onClick={() => setServiceType('development')}
                className={`flex items-center gap-2 flex-1 px-4 py-2 rounded-md transition-colors ${
                  serviceType === 'development'
                    ? 'bg-white text-[#5CD2C6] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Brain className="w-5 h-5" />
                Развитие
              </button>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Подкатегория
              </label>
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Стоимость (₽/занятие) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Максимальное количество учеников *
                </label>
                <input
                  type="number"
                  name="max_students"
                  value={formData.max_students}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Возраст от (лет) *
                </label>
                <input
                  type="number"
                  name="age_from"
                  value={formData.age_from}
                  onChange={handleChange}
                  min="0"
                  max="18"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Возраст до (лет) *
                </label>
                <input
                  type="number"
                  name="age_to"
                  value={formData.age_to}
                  onChange={handleChange}
                  min="0"
                  max="18"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Длительность (в минутах) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Телефон
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Адрес <span className="text-red-500">*</span>
              </label>
              <AddressAutocomplete
                value={formData.address}
                className="text-gray-700"
                onChange={handleAddressChange}
                error={error && !formData.address ? 'Обязательное поле' : undefined}
              />
            </div>

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
                      {photo.isMain && (
                        <div className="absolute top-2 left-2 bg-yellow-400 text-white p-1 rounded-full">
                          <Star className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {photo.isMain && (
                        <button
                          type="button"
                          onClick={() => setMainPhotoIndex(index)}
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
                        <XIcon className="w-4 h-4" />
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
                      multiple
                      accept="image/*"
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

      <ConfirmModal
        isOpen={photoToDelete !== null}
        onClose={() => {
          setPhotoToDelete(null)
        }}
        onConfirm={confirmPhotoDelete}
        title="Удаление фото"
        message="Вы уверены, что хотите удалить это фото?"
      />
    </AnimatePresence>
  )
} 