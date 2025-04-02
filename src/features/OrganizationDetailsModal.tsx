'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Trash, Edit, Save, ArrowLeft, Loader2 } from 'lucide-react'
import { Sport } from '@/services/sports.service'
import { useNotifications } from '@/shared/lib/hooks/useNotifications'
import Reviews from './Reviews'
import ConfirmModal from '../shared/ui/ConfirmModal'
import { ServicesService } from '@/services/services.service'

interface OrganizationDetailsModalProps {
  sport: Sport
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

export default function OrganizationDetailsModal({
  sport,
  isOpen,
  onClose,
  onDelete,
  onEdit
}: OrganizationDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { showNotification } = useNotifications()
  const modalRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    name: sport.name,
    description: sport.description || "",
    category: sport.type,
    price: +sport.price || 0,
    max_students: sport.maxStudents,
    age_from: sport.ageRange[0],
    age_to: sport.ageRange[1],
    duration: sport.duration,
    address: sport.address
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      await ServicesService.updateService(sport.id, formData)
      showNotification({
        title: 'Успешно',
        message: 'Услуга обновлена',
        type: 'success'
      })
      setIsEditing(false)
      onEdit(sport.id)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при обновлении услуги')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? sport.images.length - 1 : prev - 1
    )
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === sport.images.length - 1 ? 0 : prev + 1
    )
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={handleBackdropClick}
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
                <h2 className="text-2xl font-bold text-gray-900">Редактирование услуги</h2>
              </div>
            ) : (
              <h2 className="text-2xl font-bold text-gray-900">{sport.name}</h2>
            )}
            <button onClick={onClose}>
              <X className="w-6 h-6 text-gray-900" />
            </button>
          </div>

          {/* Gallery */}
          {!isEditing && (
            <div className="relative mb-6">
              <div className="aspect-video relative">
                <Image
                  src={sport.images[currentImageIndex]}
                  alt={`${sport.name} - фото ${currentImageIndex + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
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
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {sport.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-20 h-20 flex-shrink-0 ${
                      currentImageIndex === index ? 'ring-2 ring-[#5CD2C6]' : ''
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${sport.name} - миниатюра ${index + 1}`}
                      fill
                      className="object-cover rounded"
                    />
                  </button>
                ))}
              </div>
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

          {/* Details or Edit Form */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Цена
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Макс. количество учеников
                  </label>
                  <input
                    type="number"
                    name="max_students"
                    value={formData.max_students}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Возраст от
                  </label>
                  <input
                    type="number"
                    name="age_from"
                    value={formData.age_from}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Возраст до
                  </label>
                  <input
                    type="number"
                    name="age_to"
                    value={formData.age_to}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Длительность (мин)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Адрес
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6]"
                  required
                />
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
            <>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Описание</h3>
                <p className="text-gray-900">{sport.description}</p>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-700">Адрес:</p>
                    <p className="font-medium text-gray-900">{sport.address}</p>
                  </div>
                  <div>
                    <p className="text-gray-700">Длительность:</p>
                    <p className="font-medium text-gray-900">{sport.duration} мин</p>
                  </div>
                  <div>
                    <p className="text-gray-700">Возраст:</p>
                    <p className="font-medium text-gray-900">{sport.ageRange[0]}-{sport.ageRange[1]} лет</p>
                  </div>
                  <div>
                    <p className="text-gray-700">Размер группы:</p>
                    <p className="font-medium text-gray-900">до {sport.maxStudents} человек</p>
                  </div>
                  <div>
                    <p className="text-gray-700">Цена:</p>
                    <p className="font-medium text-gray-900">{sport.price} ₽</p>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Отзывы</h3>
                <Reviews sportId={sport.id} />
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={() => {
          onDelete(sport.id)
          setIsConfirmDeleteOpen(false)
        }}
        title="Удаление услуги"
        message="Вы уверены, что хотите удалить эту услугу? Это действие нельзя будет отменить."
      />
    </>
  )
} 