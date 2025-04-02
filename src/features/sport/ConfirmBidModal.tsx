'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Loader2, Users } from 'lucide-react'
import { Schedule } from '@/services/schedule.service'
import { Service } from '@/services/services.service'
import { BidsService } from '@/services/bids.service'
import { useAuth } from '@/shared/lib/hooks/useAuth'
import { useNotifications } from '@/shared/lib/hooks/useNotifications'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import Image from 'next/image'
import { formatTime, calculateEndTime } from '@/shared/lib/utils/time'

interface ConfirmBidModalProps {
  isOpen: boolean
  onClose: () => void
  schedule: Schedule | null
  service: Service | null
}

const checkExistingBid = (bids: Bid[], userId: string): boolean => {
  return bids.some(bid => {
    const bidUserId = bid.userId || bid.user_id
    return bidUserId === userId && bid.status === 'active'
  })
}

export default function ConfirmBidModal({ 
  isOpen, 
  onClose, 
  schedule,
  service 
}: ConfirmBidModalProps) {
  const { user } = useAuth()
  const { showNotification } = useNotifications()
  const [isLoading, setIsLoading] = useState(false)
  const [existingBids, setExistingBids] = useState<Bid[]>([])
  const [isCheckingBids, setIsCheckingBids] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    const loadBids = async () => {
      if (!isOpen || !schedule || !user) return
      
      try {
        setIsCheckingBids(true)
        const bids = await BidsService.getScheduleBids(schedule.id)
        setExistingBids(bids)
      } catch (err) {
        console.error('Ошибка при загрузке списка записей:', err)
      } finally {
        setIsCheckingBids(false)
      }
    }

    loadBids()
  }, [isOpen, schedule, user])

  if (!isOpen || !schedule || !service) return null

  const hasExistingBid = user && checkExistingBid(existingBids, user.id)

  // Находим существующую заявку пользователя
  const userBid = user && existingBids.find(bid => 
    (bid.userId === user.id || bid.user_id === user.id) && 
    bid.status === 'active'
  )

  const handleConfirm = async () => {
    if (!user || !schedule) return

    try {
      setIsLoading(true)
      await BidsService.createBid({
        userId: user.id,
        scheduleId: schedule.id
      })

      showNotification({
        title: 'Успешно',
        message: 'Вы записаны на занятие',
        type: 'success'
      })
      onClose()
    } catch (err: any) {
      showNotification({
        title: 'Ошибка',
        message: err.response?.data?.message || 'Не удалось записаться на занятие',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!user || !userBid) return

    try {
      setIsCancelling(true)
      await BidsService.cancelBid({
        id: userBid.id,
        userId: user.id
      })

      showNotification({
        title: 'Успешно',
        message: 'Запись отменена',
        type: 'success'
      })
      
      // Обновляем список заявок
      const updatedBids = await BidsService.getScheduleBids(schedule.id)
      setExistingBids(updatedBids)
    } catch (err: any) {
      showNotification({
        title: 'Ошибка',
        message: err.response?.data?.message || 'Не удалось отменить запись',
        type: 'error'
      })
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-lg p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Запись на занятие
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 mb-6">
          {/* Информация о преподавателе */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 relative flex-shrink-0">
              {schedule.teacher.avatar ? (
                <Image
                  src={schedule.teacher.avatar}
                  alt={`${schedule.teacher.first_name} ${schedule.teacher.last_name}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600">
                  {schedule.teacher.first_name[0]}
                </div>
              )}
            </div>
            <div>
              <p className="text-gray-900 font-medium">
                {schedule.teacher.first_name} {schedule.teacher.last_name}
              </p>
              <p className="text-gray-600 text-sm">Преподаватель</p>
            </div>
          </div>

          {/* Основная информация */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Дата:</p>
              <p className="text-gray-900 font-medium">
                {format(new Date(schedule.date), 'd MMMM yyyy', { locale: ru })}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Время:</p>
              <p className="text-gray-900 font-medium">
                {formatTime(schedule.startTime)} - {calculateEndTime(schedule.startTime, service.duration)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Длительность:</p>
              <p className="text-gray-900 font-medium">
                {service.duration} минут
              </p>
            </div>
            <div>
              <p className="text-gray-600">Участники:</p>
              <p className="text-gray-900 font-medium flex items-center gap-1">
                <Users className="w-4 h-4" />
                {schedule.currentParticipants} / {service.max_students}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Закрыть
          </button>

          {hasExistingBid ? (
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
            >
              {isCancelling && <Loader2 className="w-4 h-4 animate-spin" />}
              Отменить запись
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={
                isLoading || 
                isCheckingBids || 
                schedule.currentParticipants >= service.max_students
              }
              className="px-4 py-2 bg-[#5CD2C6] text-white rounded-lg hover:bg-[#4BC0B5] disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isCheckingBids ? 'Проверка...' :
               schedule.currentParticipants >= service.max_students ? 'Мест нет' : 
               'Записаться'}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
} 