'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Schedule } from '@/services/schedule.service'
import { Service } from '@/services/services.service'
import { addDays, startOfWeek, format, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import ConfirmBidModal from './ConfirmBidModal'
import { formatTime, calculateEndTime } from '@/utils/time'

interface SportScheduleProps {
  schedule: Schedule[]
  service: Service | null
  isLoading?: boolean
}

export default function SportSchedule({ schedule, service, isLoading }: SportScheduleProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState<Schedule | null>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const handlePrevWeek = () => {
    setCurrentDate(prev => addDays(prev, -7))
  }

  const handleNextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7))
  }

  const handleSlotClick = (slot: Schedule) => {
    setSelectedSlot(slot)
    setIsConfirmModalOpen(true)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Расписание занятий</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevWeek}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <span className="text-gray-900 font-medium">
            {format(weekStart, 'd MMMM', { locale: ru })} - {format(addDays(weekStart, 6), 'd MMMM', { locale: ru })}
          </span>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {weekDays.map(day => (
                  <th
                    key={day.toString()}
                    className="px-4 py-2 border-b text-gray-900 font-medium"
                  >
                    <div>{format(day, 'EEEE', { locale: ru })}</div>
                    <div className="text-sm text-gray-600">{format(day, 'd MMM', { locale: ru })}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {weekDays.map(day => (
                  <td key={day.toString()} className="border p-2 align-top">
                    <div className="space-y-2">
                      {schedule
                        .filter(slot => isSameDay(new Date(slot.date), day))
                        .map(slot => (
                          <button
                            key={slot.id}
                            onClick={() => handleSlotClick(slot)}
                            className="w-full p-2 text-left rounded hover:bg-gray-50 transition-colors"
                          >
                            <div className="text-gray-900 font-medium">
                              {formatTime(slot.startTime)} - {calculateEndTime(slot.startTime, service?.duration || 0)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Доступно для записи
                            </div>
                          </button>
                        ))}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <ConfirmBidModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        schedule={selectedSlot}
        service={service}
      />
    </div>
  )
} 