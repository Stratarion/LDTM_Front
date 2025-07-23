'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Search, User } from 'lucide-react'
import { CreateEventDto, ScheduleService } from '@/entities/schedule/schedule.service'
import { ServicesAPI } from '@/shared/api/services.api'
import { useAuth } from '@/shared/lib/hooks/useAuth'
import { User as UserType } from '@/entities/user/model/user'
import { debounce } from '@/shared/lib/utils/debounce'
import { IService } from '@/entities/service/model/service'

interface AddEventFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  date: string
  startTime: string
  serviceId: string
  teacherId: string
  maxStudents: string
  ownerId: string
}

export default function AddEventForm({
  isOpen,
  onClose,
  onSuccess
}: AddEventFormProps) {
  const { user } = useAuth()
  const [services, setServices] = useState<IService[]>([])
  const [teachers, setTeachers] = useState<UserType[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    date: '',
    startTime: '',
    serviceId: '',
    teacherId: '',
    maxStudents: '',
    ownerId: ''
  })
  const [isCurrentUser, setIsCurrentUser] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Устанавливаем ownerId при монтировании компонента
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        ownerId: user.id
      }))
    }
  }, [user])

  // Загрузка списка услуг
  useEffect(() => {
    const loadServices = async () => {
      if (!user) return
      try {
        const sportServices = await ServicesAPI.getUserServices(user.id, 'sport')
        const devServices = await ServicesAPI.getUserServices(user.id, 'development')
        setServices([...sportServices, ...devServices])
      } catch (err) {
        console.error('Failed to load services:', err)
      }
    }
    loadServices()
  }, [user])

  // Поиск преподавателей
  const searchTeachers = debounce(async (query: string) => {
    if (!query) {
      setTeachers([])
      return
    }
    setIsSearching(true)
    try {
      const data = await ScheduleService.getTeachers(query)
      setTeachers(data)
    } catch (err) {
      console.error('Failed to search teachers:', err)
    } finally {
      setIsSearching(false)
    }
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    searchTeachers(query)
  }

  const handleTeacherSelect = (teacher: UserType) => {
    setFormData(prev => ({ ...prev, teacherId: teacher.id }))
    setSearchQuery(teacher.first_name)
    setTeachers([])
  }

  const handleCurrentUserToggle = () => {
    setIsCurrentUser(!isCurrentUser)
    if (!isCurrentUser && user) {
      setFormData(prev => ({ ...prev, teacherId: user.id }))
      setSearchQuery(user.first_name)
    } else {
      setFormData(prev => ({ ...prev, teacherId: '' }))
      setSearchQuery('')
    }
  }

  // Обновление maxStudents при выборе услуги
  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedService = services.find(service => service.id === e.target.value)
    debugger;
    setFormData(prev => ({
      ...prev,
      serviceId: e.target.value,
      maxStudents: selectedService ? String(selectedService.max_students) : ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.date || !formData.startTime || !formData.serviceId || !formData.teacherId || !formData.ownerId) {
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
      const eventData: CreateEventDto = {
        ...formData,
        maxStudents: Number(formData.maxStudents),
        ownerId: user!.id
      }
      await ScheduleService.createEvent(eventData)
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Произошла ошибка при создании занятия')
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
              Добавить занятие
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
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Время начала *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Услуга *
              </label>
              <select
                name="serviceId"
                value={formData.serviceId}
                onChange={handleServiceChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                required
              >
                <option value="">Выберите услугу</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} (макс. {service.max_students} участников)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Преподаватель *
              </label>
              <div className="relative">
                <div className="flex items-center gap-4 mb-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isCurrentUser}
                      onChange={handleCurrentUserToggle}
                      className="rounded border-gray-300 text-[#5CD2C6] focus:ring-[#5CD2C6]"
                    />
                    <span className="text-sm text-gray-700">Я буду преподавателем</span>
                  </label>
                </div>
                {!isCurrentUser && (
                  <>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Поиск преподавателя..."
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                      )}
                    </div>
                    {teachers.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                        {teachers.map(teacher => (
                          <button
                            key={teacher.id}
                            type="button"
                            onClick={() => handleTeacherSelect(teacher)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                          >
                            {teacher.avatar ? (
                              <img
                                src={teacher.avatar}
                                alt={teacher.first_name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-8 h-8 p-1 rounded-full bg-gray-100 text-gray-600" />
                            )}
                            <span>{teacher.first_name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Максимальное количество участников *
              </label>
              <input
                type="number"
                name="maxStudents"
                value={formData.maxStudents}
                disabled={true}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Максимальное количество участников определяется выбранной услугой
              </p>
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