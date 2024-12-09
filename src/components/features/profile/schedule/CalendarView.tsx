'use client'

import { useState } from 'react'
import { ScheduleEvent } from '@/services/schedule.service'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns'
import { ru } from 'date-fns/locale'

interface CalendarViewProps {
  events: ScheduleEvent[]
  onEventClick: (event: ScheduleEvent) => void
  currentDate: Date
  onPrevPeriod: () => void
  onNextPeriod: () => void
}

export default function CalendarView({ 
  events, 
  onEventClick, 
  currentDate,
  onPrevPeriod,
  onNextPeriod 
}: CalendarViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart, { locale: ru })
  const calendarEnd = endOfWeek(monthEnd, { locale: ru })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const formatTime = (time: string) => time.slice(0, 5)

  const handlePrevMonth = () => {
    onPrevPeriod()
  }

  const handleNextMonth = () => {
    onNextPeriod()
  }

  return (
    <div className="p-6">
      {/* Навигация по месяцам */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-medium text-gray-900">
          {format(currentDate, 'LLLL yyyy', { locale: ru })}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Календарная сетка */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {/* Названия дней недели */}
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center">
            <span className="text-sm font-medium text-gray-500">{day}</span>
          </div>
        ))}

        {/* Дни */}
        {days.map((day: Date) => {
          const dayEvents = events.filter((event: ScheduleEvent) => 
            isSameDay(new Date(event.date), day)
          )

          return (
            <div
              key={day.toString()}
              className={`bg-white p-2 min-h-[120px] ${
                !isSameMonth(day, currentDate) ? 'bg-gray-50' : ''
              }`}
            >
              <div className={`text-right ${
                isSameDay(day, new Date())
                  ? 'text-[#5CD2C6] font-medium'
                  : !isSameMonth(day, currentDate)
                  ? 'text-gray-400'
                  : 'text-gray-900'
              }`}>
                {format(day, 'd')}
              </div>
              <div className="mt-1 space-y-1">
                {dayEvents
                  .sort((a: ScheduleEvent, b: ScheduleEvent) => 
                    a.startTime.localeCompare(b.startTime)
                  )
                  .map((event: ScheduleEvent) => (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={`w-full p-2 rounded text-left text-xs ${
                        event.status === 'cancelled'
                          ? 'bg-gray-100 text-gray-400'
                          : 'bg-[#5CD2C6]/20 hover:bg-[#5CD2C6]/30 text-gray-900'
                      }`}
                    >
                      <div className="font-semibold">
                        {formatTime(event.startTime)}
                      </div>
                      <div className="truncate font-medium">
                        {event.service?.name}
                      </div>
                      <div className="text-[10px] text-gray-600 truncate">
                        {event.teacher?.name}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 