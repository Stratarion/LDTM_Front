'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Trash, Edit } from 'lucide-react'
import { Sport } from '@/services/sports.service'
import { useNotifications } from '@/hooks/useNotifications'
import Reviews from './Reviews'

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
  const { showNotification } = useNotifications()
  const modalRef = useRef<HTMLDivElement>(null)

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

  const handleDelete = () => {
    showNotification({
      title: 'Удаление организации',
      message: 'Вы уверены, что хотите удалить эту организацию?',
      type: 'warning',
      actions: [
        {
          label: 'Удалить',
          onClick: () => onDelete(sport.id),
          variant: 'destructive'
        },
        {
          label: 'Отмена',
          onClick: () => {},
          variant: 'outline'
        }
      ]
    })
  }

  const handleEdit = () => {
    onEdit(sport.id)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{sport.name}</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        {/* Gallery */}
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

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-[#5CD2C6] text-white rounded-lg hover:bg-[#4BC0B5]"
          >
            <Edit className="w-4 h-4" />
            Редактировать
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            <Trash className="w-4 h-4" />
            Удалить
          </button>
        </div>

        {/* Details */}
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
          <Reviews sportId={sport.id} readOnly />
        </div>
      </div>
    </div>
  )
} 