'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Clock, Users, Calendar as CalendarIcon } from 'lucide-react'
import { ScheduleEvent, ScheduleService } from '@/services/schedule.service'
import Image from 'next/image'

interface EventDetailsProps {
  event: ScheduleEvent | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export default function EventDetails({
  event,
  isOpen,
  onClose,
  onUpdate
}: EventDetailsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !event) return null

  const handleCancel = async () => {
    if (!confirm('Вы уверены, что хотите отменить занятие?')) return

    setIsLoading(true)
    setError('')

    try {
      await ScheduleService.cancelEvent(event.id)
      onUpdate()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Произошла ошибка при отмене занятия')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5) // Обрезаем до HH:MM
  }

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
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {event.service.name}
              </h2>
              <p className="text-gray-600">
                {event.service.description}
              </p>
            </div>
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

          <div className="space-y-6">
            {/* Информация о занятии */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <CalendarIcon className="w-5 h-5" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>{formatTime(event.startTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-5 h-5" />
                <span>{event.currentParticipants}/{event.maxParticipants} участников</span>
              </div>
            </div>

            {/* Информация о преподавателе */}
            <div className="border-t border-b border-gray-100 py-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Преподаватель
              </h3>
              <div className="flex items-center gap-3">
                {event.teacher.avatar_url ? (
                  <Image
                    src={event.teacher.avatar_url}
                    alt={event.teacher.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {event.teacher.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{event.teacher.name}</p>
                  <p className="text-sm text-gray-500">{event.teacher.email}</p>
                </div>
              </div>
            </div>

            {/* Список участников */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Участники ({event.participants.length})
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {event.participants.map(participant => (
                  <div key={participant.id} className="flex items-center gap-3">
                    {participant.avatar_url ? (
                      <Image
                        src={participant.avatar_url}
                        alt={participant.name}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-sm text-gray-600 font-medium">
                          {participant.name?.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                      <p className="text-xs text-gray-500">{participant.email}</p>
                    </div>
                  </div>
                ))}
                {event.participants.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Пока нет участников
                  </p>
                )}
              </div>
            </div>

            {/* Действия */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Закрыть
              </button>
              {event.status === 'active' && (
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Отменить занятие
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 