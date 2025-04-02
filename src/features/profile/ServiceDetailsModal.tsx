'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Trash, Edit, Save, ArrowLeft, Loader2, Upload, Star } from 'lucide-react'
import { ServicesService } from '@/services/services.service'
import { ServiceType, useNotifications } from '@/shared/lib/hooks/useNotifications'
import { ConfirmModal } from '@/shared/ui/confirmModal'
import { Photo, PhotosService } from '@/services/photos.service'
import { useAuth } from '@/shared/lib/hooks/useAuth'
import { validateImage, resizeImage } from '@/shared/lib/utils/image'
import { Service, ServiceAddress } from '@/shared/types/service'

interface ServiceDetailsModalProps {
  serviceId: string
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

export default function ServiceDetailsModal({
  serviceId,
  isOpen,
  onClose,
  onDelete,
  onEdit
}: ServiceDetailsModalProps) {
  const { user } = useAuth()
  const [service, setService] = useState<Service | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [isConfirmPhotoDeleteOpen, setIsConfirmPhotoDeleteOpen] = useState(false)
  const [isConfirmPhotoUploadOpen, setIsConfirmPhotoUploadOpen] = useState(false)
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showNotification } = useNotifications()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,
    max_students: 0,
    age_from: 0,
    age_to: 0,
    duration: 0,
    address: {
      full: '',
      coordinates: undefined as number[] | undefined
    } as ServiceAddress,
    phone: '',
    email: '',
    subcategory: '',
    status: ''
  })

  useEffect(() => {
    const loadService = async () => {
      const data = await ServicesService.getServiceById(serviceId)
      setService(data)
      setPhotos(data?.photos || [])
      if (data) {
        setFormData({
          name: data.name,
          description: data.description || '',
          category: data.category,
          price: Number(data.price) || 0,
          max_students: data.max_students || 0,
          age_from: data.age_from || 0,
          age_to: data.age_to || 0,
          duration: data.duration || 0,
          address: data.address || {
            full: '',
            coordinates: undefined
          },
          phone: data.phone || '',
          email: data.email || '',
          subcategory: data.subcategory || '',
          status: data.status || 'active'
        })
      }
    }
    loadService()
  }, [serviceId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    if (!service) return
    try {
      await ServicesService.updateService(service.id, formData)
      showNotification({
        title: 'Успешно',
        message: 'Услуга обновлена',
        type: 'success'
      })
      setIsEditing(false)
      onEdit(service.id)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при обновлении услуги')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoDelete = async (photoId: string) => {
    setSelectedPhotoId(photoId)
    setIsConfirmPhotoDeleteOpen(true)
  }

  const confirmPhotoDelete = async () => {
    if (!selectedPhotoId) return

    try {
      await PhotosService.deletePhoto(selectedPhotoId)
      setPhotos(photos.filter(p => p.id !== selectedPhotoId))
      showNotification({
        title: 'Успешно',
        message: 'Фото удалено',
        type: 'success'
      })
    } catch (err) {
      console.error(err)
      showNotification({
        title: 'Ошибка',
        message: 'Не удалось удалить фото',
        type: 'error'
      })
    } finally {
      setIsConfirmPhotoDeleteOpen(false)
      setSelectedPhotoId(null)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      validateImage(file)
      setSelectedFile(file)
      setIsConfirmPhotoUploadOpen(true)
    } catch (err: any) {
      console.error(err)
      showNotification({
        title: 'Ошибка',
        message: err.message,
        type: 'error'
      })
    }
  }

  const confirmPhotoUpload = async () => {
    if (!selectedFile || !user || !service) return

    try {
      const resizedImage = await resizeImage(selectedFile)
      const newPhoto = await PhotosService.uploadPhoto(
        new File([resizedImage], selectedFile.name, { type: 'image/jpeg' }),
        'service',
        service.id,
        user.id
      )
      setPhotos([...photos, newPhoto])
      showNotification({
        title: 'Успешно',
        message: 'Фото загружено',
        type: 'success'
      })
    } catch (err) {
      console.error(err)
      showNotification({
        title: 'Ошибка',
        message: 'Не удалось загрузить фото',
        type: 'error'
      })
    } finally {
      setIsConfirmPhotoUploadOpen(false)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSetMainPhoto = async (photoId: string) => {
    try {
      const currentMain = photos.find(p => p.description === 'main')
      if (currentMain) {
        await PhotosService.updatePhoto(currentMain.id, { description: '' })
      }

      await PhotosService.updatePhoto(photoId, { description: 'main' })
      
      setPhotos((prevPhotos) => prevPhotos.map((p: Photo) => ({
        ...p,
        description: p.id === photoId ? 'main' : 
                    p.description === 'main' ? '' : 
                    p.description
      })))

      showNotification({
        title: 'Успешно',
        message: 'Главное фото обновлено',
        type: 'success'
      })
    } catch (err) {
      console.error(err)
      showNotification({
        title: 'Ошибка',
        message: 'Не удалось обновить главное фото',
        type: 'error'
      })
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'max_students' || name === 'age_from' || 
              name === 'age_to' || name === 'duration' 
        ? Number(value)
        : name === 'category'
        ? value as ServiceType
        : value
    }))
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? photos.length - 1 : prev - 1
    )
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === photos.length - 1 ? 0 : prev + 1
    )
  }

  if (!isOpen) return null

  if (!service) {
    return (
      <div className="bg-gray-200">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div 
          className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            {isEditing ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                  Редактирование услуги
                </h2>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900">
                  {service?.name}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsConfirmDeleteOpen(true)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                  <button onClick={onClose}>
                    <X className="w-6 h-6 text-gray-900" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Gallery */}
          {!isEditing && photos.length > 0 && (
            <div className="relative mb-6">
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <Image
                  src={photos[currentImageIndex].url}
                  alt={`Фото ${currentImageIndex + 1}`}
                  fill
                  className="object-cover"
                />
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden ${
                      index === currentImageIndex ? 'ring-2 ring-[#5CD2C6]' : ''
                    }`}
                  >
                    <Image
                      src={photo.url}
                      alt={`Превью ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Название */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                    required
                  />
                </div>

                {/* Описание */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                  />
                </div>

                {/* Категория */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Категория
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                    required
                  >
                    <option value="sport">Спорт</option>
                    <option value="development">Развитие</option>
                  </select>
                </div>

                {/* Цена */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Цена (₽)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                    required
                  />
                </div>

                {/* Максимальное количество учеников */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Макс. количество учеников
                  </label>
                  <input
                    type="number"
                    name="max_students"
                    value={formData.max_students}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                    required
                  />
                </div>

                {/* Возраст от */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Возраст от
                  </label>
                  <input
                    type="number"
                    name="age_from"
                    value={formData.age_from}
                    onChange={handleChange}
                    min="0"
                    max="18"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                    required
                  />
                </div>

                {/* Возраст до */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Возраст до
                  </label>
                  <input
                    type="number"
                    name="age_to"
                    value={formData.age_to}
                    onChange={handleChange}
                    min="1"
                    max="18"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                    required
                  />
                </div>

                {/* Длительность */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Длительность (мин)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min="15"
                    max="480"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                    required
                  />
                </div>

                {/* Адрес */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Адрес
                  </label>
                  <input
                    type="text"
                    name="address.full"
                    value={formData.address.full}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: {
                        ...prev.address,
                        full: e.target.value
                      }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                    required
                  />
                </div>

                {/* Статус */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Статус
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                    required
                  >
                    <option value="active">Активна</option>
                    <option value="inactive">Неактивна</option>
                    <option value="deleted">Удалена</option>
                  </select>
                </div>
              </div>

              {/* Управление фотографиями */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Фотографии</h3>
                <div className="grid grid-cols-5 gap-4">
                  {photos.map((photo, index) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square relative rounded-lg overflow-hidden">
                        <Image
                          src={photo.url}
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
                            onClick={() => handleSetMainPhoto(photo.id)}
                            className="p-1 bg-yellow-400 text-white rounded-full hover:bg-yellow-500"
                            title="Сделать главным"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handlePhotoDelete(photo.id)}
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

              {/* Кнопки формы */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#5CD2C6] text-white rounded-lg hover:bg-[#4BC0B5] disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Save className="w-4 h-4" />
                  Сохранить
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Service details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Категория:</p>
                  <p className="font-medium text-gray-900">
                    {service.category === 'sport' ? 'Спорт' : 'Развитие'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Подкатегория:</p>
                  <p className="font-medium text-gray-900">
                    {service.subcategory}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Цена:</p>
                  <p className="font-medium text-gray-900">{service.price} ₽</p>
                </div>
                <div>
                  <p className="text-gray-600">Возраст:</p>
                  <p className="font-medium text-gray-900">
                    {service.age_from}-{service.age_to} лет
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Телефон:</p>
                  <p className="font-medium text-gray-900">{service.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600">Почта:</p>
                  <p className="font-medium text-gray-900">{service.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">Длительность:</p>
                  <p className="font-medium text-gray-900">{service.duration} мин</p>
                </div>
                <div>
                  <p className="text-gray-600">Макс. количество учеников:</p>
                  <p className="font-medium text-gray-900">{service.max_students}</p>
                </div>
                <div>
                  <p className="text-gray-600">Адрес:</p>
                  <p className="font-medium text-gray-900">{service.address.full}</p>
                </div>
              </div>

              {service.description && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Описание
                  </h3>
                  <p className="text-gray-700">{service.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirm modals */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={() => {
          onDelete(service.id)
          setIsConfirmDeleteOpen(false)
        }}
        title="Удаление услуги"
        message="Вы уверены, что хотите удалить эту услугу? Это действие нельзя будет отменить."
      />

      <ConfirmModal
        isOpen={isConfirmPhotoDeleteOpen}
        onClose={() => {
          setIsConfirmPhotoDeleteOpen(false)
          setSelectedPhotoId(null)
        }}
        onConfirm={confirmPhotoDelete}
        title="Удаление фото"
        message="Вы уверены, что хотите удалить это фото?"
      />

      <ConfirmModal
        isOpen={isConfirmPhotoUploadOpen}
        onClose={() => {
          setIsConfirmPhotoUploadOpen(false)
          setSelectedFile(null)
        }}
        onConfirm={confirmPhotoUpload}
        title="Загрузка фото"
        message="Загрузить выбранное фото?"
      />
    </>
  )
} 