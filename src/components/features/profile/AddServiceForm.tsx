'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Dumbbell, Brain } from 'lucide-react'
import { ServicesService, ServiceType } from '@/services/services.service'
import { useAuth } from '@/hooks/useAuth'

interface AddServiceFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialType: ServiceType
}

interface FormData {
  name: string
  description: string
  type: 'sport' | 'development'
  price: string
  maxParticipants: string
  ageFrom: string
  ageTo: string
  address: string
}

export default function AddServiceForm({
  isOpen,
  onClose,
  onSuccess,
  initialType
}: AddServiceFormProps) {
  const { user } = useAuth()
  const [serviceType, setServiceType] = useState<ServiceType>(initialType)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    type: 'sport',
    price: '',
    maxParticipants: '',
    ageFrom: '',
    ageTo: '',
    address: ''
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.maxParticipants || !formData.ageFrom || !formData.ageTo || !formData.address) {
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
      
      // Добавляем все поля
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '') {
          formDataToSend.append(key, value)
        }
      })
      
      formDataToSend.append('type', serviceType)
      formDataToSend.append('userId', user.id)

      await ServicesService.createService(formDataToSend)
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Произошла ошибка при создании услуги')
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
          className="bg-white rounded-2xl p-6 w-full max-w-2xl"
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
                  name="maxParticipants"
                  value={formData.maxParticipants}
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
                  name="ageFrom"
                  value={formData.ageFrom}
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
                  name="ageTo"
                  value={formData.ageTo}
                  onChange={handleChange}
                  min="0"
                  max="18"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Адрес проведения
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