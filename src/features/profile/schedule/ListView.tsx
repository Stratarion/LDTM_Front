'use client'

import { ScheduleEvent } from '@/entities/schedule/schedule.service'
import { Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface ListViewProps {
  events: ScheduleEvent[]
  onEventClick: (event: ScheduleEvent) => void
  currentDate: Date
  onPrevPeriod: () => void
  onNextPeriod: () => void
}

export default function ListView({ 
  events, 
  onEventClick,
  currentDate,
  onPrevPeriod,
  onNextPeriod 
}: ListViewProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5)
  }

  // Группируем события по датам
  const groupedEvents = events.reduce((groups: Record<string, ScheduleEvent[]>, event: ScheduleEvent) => {
    const date = event.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(event)
    return groups
  }, {})

  // Сортируем даты
  const sortedDates = Object.keys(groupedEvents).sort()

  return (
    <div>
      {/* Добавляем навигацию по периодам */}
      <div className="flex items-center justify-between p-6 border-b">
        <button
          onClick={onPrevPeriod}
          className="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-medium text-gray-900">
          {format(currentDate, 'LLLL yyyy', { locale: ru })}
        </h3>
        <button
          onClick={onNextPeriod}
          className="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {sortedDates.map(date => (
          <div key={date} className="py-4">
            <h3 className="text-lg font-medium text-gray-900 px-6 mb-3">
              {formatDate(date)}
            </h3>
            <div className="space-y-2">
              {groupedEvents[date]
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map(event => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={`w-full px-6 py-3 hover:bg-gray-50 transition-colors flex items-center gap-6 ${
                      event.status === 'cancelled' ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="w-20 text-gray-600">
                      {formatTime(event.startTime)}
                    </div>
                    <div className="flex-grow text-left">
                      <h4 className="font-medium text-gray-900">
                        {event.service?.name}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Users className="w-4 h-4" />
                          <span>{event.currentParticipants}/{event.maxStudents}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {event.teacher?.first_name}
                        </div>
                      </div>
                    </div>
                    {event.status === 'cancelled' && (
                      <span className="text-sm text-red-600">Отменено</span>
                    )}
                  </button>
                ))}
            </div>
          </div>
        ))}
        {sortedDates.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            Нет запланированных занятий
          </div>
        )}
      </div>
    </div>
  )
} 