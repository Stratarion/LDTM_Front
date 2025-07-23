'use client'

import { ScheduleEvent } from '@/entities/schedule/schedule.service'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, startOfWeek, format, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'

interface WeekViewProps {
  events: ScheduleEvent[]
  onEventClick: (event: ScheduleEvent) => void
  currentDate: Date
  onPrevPeriod: () => void
  onNextPeriod: () => void
}

export default function WeekView({ 
  events, 
  onEventClick,
  currentDate,
  onPrevPeriod,
  onNextPeriod
}: WeekViewProps) {
  // Получаем начало недели
  const weekStart = startOfWeek(currentDate, { locale: ru })
  
  // Создаем массив дней недели
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const formatTime = (time: string) => time.slice(0, 5)

  const handlePrevWeek = () => {
    onPrevPeriod()
  }

  const handleNextWeek = () => {
    onNextPeriod()
  }

  return (
    <div className="p-6">
      {/* Навигация по неделям */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevWeek}
          className="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-medium text-gray-900">
          {format(weekStart, 'LLLL yyyy', { locale: ru })}
        </h3>
        <button
          onClick={handleNextWeek}
          className="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Сетка дней */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map(day => (
          <div key={day.toString()} className="space-y-2">
            <div className="text-center">
              <div className="text-sm text-gray-500">
                {format(day, 'EEEEEE', { locale: ru })}
              </div>
              <div className={`text-2xl font-medium ${
                isSameDay(day, new Date()) ? 'text-[#5CD2C6]' : 'text-gray-900'
              }`}>
                {format(day, 'd')}
              </div>
            </div>
            <div className="space-y-1">
              {events
                .filter(event => isSameDay(new Date(event.date), day))
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map(event => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={`w-full p-2 rounded-lg text-left ${
                      event.status === 'cancelled'
                        ? 'bg-gray-50 opacity-50'
                        : 'bg-[#5CD2C6]/10 hover:bg-[#5CD2C6]/20'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {formatTime(event.startTime)}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {event.service.name}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 