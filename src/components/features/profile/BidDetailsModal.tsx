'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Bid } from '@/services/bids.service'

interface BidDetailsModalProps {
  bid: Bid | null
  isOpen: boolean
  onClose: () => void
}

function formatTimeRange(date: string, startTime: string, duration: number): string {
  try {
    const [hours, minutes] = startTime.split(':');
    const start = new Date(date);
    start.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
    
    if (isNaN(start.getTime())) {
      return '--:-- - --:--';
    }
    
    const end = new Date(start.getTime() + duration * 60000);
    return `${format(start, 'HH:mm', { locale: ru })} - ${format(end, 'HH:mm', { locale: ru })}`;
  } catch (error) {
    return '--:-- - --:--';
  }
}

export default function BidDetailsModal({ bid, isOpen, onClose }: BidDetailsModalProps) {
  if (!isOpen || !bid?.schedule) return null;

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
            Информация о записи
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 mb-6">
          {/* Информация о преподавателе */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 relative flex-shrink-0">
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600">
                {bid.schedule.teacher.first_name[0]}
              </div>
            </div>
            <div>
              <p className="text-gray-900 font-medium">
                {bid.schedule.teacher.first_name} {bid.schedule.teacher.last_name}
              </p>
              <p className="text-gray-600 text-sm">Преподаватель</p>
            </div>
          </div>

          {/* Название и описание услуги */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-1">
              {bid.schedule.service.name}
            </h4>
            <p className="text-gray-600 text-sm">
              {bid.schedule.service.description}
            </p>
          </div>

          {/* Основная информация */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Дата:</p>
              <p className="text-gray-900 font-medium">
                {format(new Date(bid.schedule.date), 'd MMMM yyyy', { locale: ru })}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Время:</p>
              <p className="text-gray-900 font-medium">
                {formatTimeRange(
                  bid.schedule.date,
                  bid.schedule.startTime,
                  bid.schedule.service.duration
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Длительность:</p>
              <p className="text-gray-900 font-medium">
                {bid.schedule.service.duration} минут
              </p>
            </div>
            <div>
              <p className="text-gray-600">Участники:</p>
              <p className="text-gray-900 font-medium">
                {bid.schedule.activeBidsCount} из {bid.schedule.service.max_students}
              </p>
            </div>
          </div>

          {/* Статус записи */}
          <div>
            <p className="text-gray-600 mb-1">Статус:</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${
              bid.status === 'active' 
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {bid.status === 'active' ? 'Активна' : 'Отменена'}
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Закрыть
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
} 