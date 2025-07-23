'use client'

import { useState, useEffect } from 'react'
import { Calendar, List, Grid3X3, Plus, Loader2 } from 'lucide-react'
import { ScheduleEvent, ScheduleService } from '@/entities/schedule/schedule.service'
import { useAuth } from '@/shared/lib/hooks/useAuth'
import AddEventForm from './AddEventForm'
import EventDetails from './EventDetails'
import CalendarView from './schedule/CalendarView'
import WeekView from './schedule/WeekView'
import ListView from './schedule/ListView'
import { startOfMonth, endOfMonth, addMonths, startOfWeek, endOfWeek, addWeeks } from 'date-fns'
import { ru } from 'date-fns/locale'

type ViewType = 'calendar' | 'week' | 'list'

export default function ProviderSchedule() {
  const { user } = useAuth()
  const userId = user?.id
  const [viewType, setViewType] = useState<ViewType>('calendar')
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null)
  const [error, setError] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())

  const loadEvents = async (start: Date, end: Date) => {
    if (!userId) return

    try {
      setIsLoading(true)
      const response = await ScheduleService.getEvents(
        userId,
        start.toISOString(),
        end.toISOString()
      )
      setEvents(response.data)
    } catch (err) {
      setError('Не удалось загрузить расписание')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let start: Date
    let end: Date

    switch (viewType) {
      case 'calendar':
        start = startOfMonth(currentDate)
        end = endOfMonth(currentDate)
        break
      case 'week':
        start = startOfWeek(currentDate, { locale: ru })
        end = endOfWeek(currentDate, { locale: ru })
        break
      case 'list':
        start = startOfWeek(currentDate, { locale: ru })
        end = endOfWeek(currentDate, { locale: ru })
        break
    }

    loadEvents(start, end)
  }, [userId, currentDate, viewType])

  const handlePrevPeriod = () => {
    switch (viewType) {
      case 'calendar':
        setCurrentDate(prev => addMonths(prev, -1))
        break
      case 'week':
        setCurrentDate(prev => addWeeks(prev, -1))
        break
      case 'list':
        setCurrentDate(prev => addWeeks(prev, -1))
        break
    }
  }

  const handleNextPeriod = () => {
    switch (viewType) {
      case 'calendar':
        setCurrentDate(prev => addMonths(prev, 1))
        break
      case 'week':
        setCurrentDate(prev => addWeeks(prev, 1))
        break
      case 'list':
        setCurrentDate(prev => addWeeks(prev, 1))
        break
    }
  }

  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event)
  }

  const handleEventUpdate = async () => {
    await loadEvents(currentDate, currentDate)
    setSelectedEvent(null)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Переключатель вида */}
      <div className="flex justify-between items-center">
        <div className="flex justify-center bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewType('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewType === 'calendar'
                ? 'bg-white text-[#5CD2C6] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Календарь
          </button>
          <button
            onClick={() => setViewType('week')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewType === 'week'
                ? 'bg-white text-[#5CD2C6] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Grid3X3 className="w-5 h-5" />
            Неделя
          </button>
          <button
            onClick={() => setViewType('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewType === 'list'
                ? 'bg-white text-[#5CD2C6] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="w-5 h-5" />
            Список
          </button>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#5CD2C6] text-white rounded-lg hover:bg-[#4BC0B5] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Добавить занятие
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Отображение расписания в зависимости от выбранного вида */}
      <div className="bg-white rounded-lg border border-gray-200">
        {viewType === 'calendar' && (
          <CalendarView 
            events={events} 
            onEventClick={handleEventClick}
            currentDate={currentDate}
            onPrevPeriod={handlePrevPeriod}
            onNextPeriod={handleNextPeriod}
          />
        )}
        {viewType === 'week' && (
          <WeekView 
            events={events} 
            onEventClick={handleEventClick}
            currentDate={currentDate}
            onPrevPeriod={handlePrevPeriod}
            onNextPeriod={handleNextPeriod}
          />
        )}
        {viewType === 'list' && (
          <ListView 
            events={events} 
            onEventClick={handleEventClick}
            currentDate={currentDate}
            onPrevPeriod={handlePrevPeriod}
            onNextPeriod={handleNextPeriod}
          />
        )}
      </div>

      {/* Модальные окна */}
      <AddEventForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false)
          loadEvents(currentDate, currentDate)
        }}
      />

      <EventDetails
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onUpdate={handleEventUpdate}
      />
    </div>
  )
} 