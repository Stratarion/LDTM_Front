'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Trash, Edit, Save, ArrowLeft, Loader2, Upload, Star } from 'lucide-react'
import { Organization } from '@/types/organization'
import { useNotifications } from '@/shared/lib/hooks/useNotifications'
import { ConfirmModal } from '@/shared/ui/confirmModal'
import { OrganizationsService } from '@/entities/organization/api/organization.service'
import { Photo, PhotosService } from '@/services/photos.service'
import { useAuth } from '@/shared/lib/hooks/useAuth'
import { validateImage, resizeImage } from '@/shared/lib/utils/image'

interface OrganizationDetailsModalProps {
  organization: Organization
  photos: Photo[]
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

export default function OrganizationDetailsModal({
  organization,
  photos: initialPhotos,
  isOpen,
  onClose,
  onDelete,
  onEdit
}: OrganizationDetailsModalProps) {
  const { user } = useAuth()
  const [photos, setPhotos] = useState(initialPhotos)
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
  const modalRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    name: organization.name,
    description: organization.description || '',
    address: organization.address || '',
    email: organization.email || '',
    phone: organization.phone || '',
    director_name: organization.director_name,
    type: organization.type,
    school_type: organization.school_type,
    max_count: organization.max_count || 0,
    approach: organization.approach || '',
    cost_info: organization.cost_info || 0,
    website: organization.website || ''
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await OrganizationsService.updateOrganization(organization.id, formData)
      showNotification({
        title: 'Успешно',
        message: 'Организация обновлена',
        type: 'success'
      })
      setIsEditing(false)
      onEdit(organization.id)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при обновлении организации')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

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
      showNotification({
        title: 'Ошибка',
        message: err.message,
        type: 'error'
      })
    }
  }

  const confirmPhotoUpload = async () => {
    if (!selectedFile || !user) return

    try {
      const resizedImage = await resizeImage(selectedFile)
      const newPhoto = await PhotosService.uploadPhoto(
        new File([resizedImage], selectedFile.name, { type: 'image/jpeg' }),
        'organization',
        organization.id,
        user.id
      )
      setPhotos([...photos, {
        id: newPhoto.id, url: newPhoto.url,
        description: ''
      }])
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
      
      setPhotos(photos.map(p => ({
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

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div 
          ref={modalRef}
          className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
        >
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
                  Редактирование организации
                </h2>
              </div>
            ) : (
              <h2 className="text-2xl font-bold text-gray-900">
                {organization.name}
              </h2>
            )}
            <button onClick={onClose}>
              <X className="w-6 h-6 text-gray-900" />
            </button>
          </div>

          {/* Gallery */}
          {!isEditing && photos.length > 0 && (
            <div className="relative mb-6">
              <div className="aspect-video relative">
                <Image
                  src={photos[currentImageIndex].url || ''}
                  alt={`${organization.name} - фото ${currentImageIndex + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-900" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-900" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto">
                  {photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-20 h-20 flex-shrink-0 ${
                        currentImageIndex === index ? 'ring-2 ring-[#5CD2C6]' : ''
                      }`}
                    >
                      <Image
                        src={photo.url || ''}
                        alt={`${organization.name} - миниатюра ${index + 1}`}
                        fill
                        className="object-cover rounded"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#5CD2C6] text-white rounded-lg hover:bg-[#4BC0B5]"
              >
                <Edit className="w-4 h-4" />
                Редактировать
              </button>
              <button
                onClick={() => setIsConfirmDeleteOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <Trash className="w-4 h-4" />
                Удалить
              </button>
            </div>
          )}

          {/* Content */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                  {error}
                </div>
              )}

              {/* Форма редактирования */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6]"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Адрес
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ФИО директора
                  </label>
                  <input
                    type="text"
                    name="director_name"
                    value={formData.director_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Максимальное количество учеников
                  </label>
                  <input
                    type="number"
                    name="max_count"
                    value={formData.max_count}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6]"
                  />
                </div>

                {organization.school_type === 'private' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Стоимость (₽/месяц)
                    </label>
                    <input
                      type="number"
                      name="cost_info"
                      value={formData.cost_info}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Подход к обучению
                  </label>
                  <input
                    type="text"
                    name="approach"
                    value={formData.approach}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Веб-сайт
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6]"
                  />
                </div>
              </div>

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
              {organization.description && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Описание
                  </h3>
                  <p className="text-gray-700">{organization.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {organization.address && (
                  <div>
                    <p className="text-gray-600">Адрес:</p>
                    <p className="font-medium text-gray-900">{organization.address}</p>
                  </div>
                )}

                {organization.email && (
                  <div>
                    <p className="text-gray-600">Email:</p>
                    <p className="font-medium text-gray-900">{organization.email}</p>
                  </div>
                )}

                {organization.phone && (
                  <div>
                    <p className="text-gray-600">Телефон:</p>
                    <p className="font-medium text-gray-900">{organization.phone}</p>
                  </div>
                )}

                <div>
                  <p className="text-gray-600">Директор:</p>
                  <p className="font-medium text-gray-900">{organization.director_name}</p>
                </div>

                {organization.max_count && (
                  <div>
                    <p className="text-gray-600">Максимальное количество учеников:</p>
                    <p className="font-medium text-gray-900">{organization.max_count}</p>
                  </div>
                )}

                {organization.school_type === 'private' && organization.cost_info && (
                  <div>
                    <p className="text-gray-600">Стоимость:</p>
                    <p className="font-medium text-gray-900">
                      {organization.cost_info.toLocaleString()} ₽/месяц
                    </p>
                  </div>
                )}

                {organization.approach && (
                  <div>
                    <p className="text-gray-600">Подход к обучению:</p>
                    <p className="font-medium text-gray-900">{organization.approach}</p>
                  </div>
                )}

                {organization.website && (
                  <div>
                    <p className="text-gray-600">Веб-сайт:</p>
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {organization.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Gallery section */}
          {isEditing && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Фотографии</h3>
              <div className="grid grid-cols-5 gap-4">
                {photos.map((photo, index) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square relative rounded-lg overflow-hidden">
                      <Image
                        src={photo.url || ''}
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
                          onClick={() => handleSetMainPhoto(photo.id)}
                          className="p-1 bg-yellow-400 text-white rounded-full hover:bg-yellow-500"
                          title="Сделать главным"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
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
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={() => {
          onDelete(organization.id)
          setIsConfirmDeleteOpen(false)
        }}
        title="Удаление ��рганизации"
        message="Вы уверены, что хотите удалить эту организацию? Это действие нельзя будет отменить."
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