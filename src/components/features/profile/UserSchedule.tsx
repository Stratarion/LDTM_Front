'use client'

import { useState, useEffect } from 'react'
import { Loader2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { BidsService } from '@/services/bids.service'
import { useAuth } from '@/hooks/useAuth'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import Image from 'next/image'
import BidDetailsModal from './BidDetailsModal'
import { Bid } from '@/services/bids.service'

function formatTimeRange(date: string, startTime: string, duration: number): string {
  try {
    // Комбинируем дату и время
    const [hours, minutes] = startTime.split(':');
    const start = new Date(date);
    start.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
    
    if (isNaN(start.getTime())) {
      console.error('Invalid date or time:', { date, startTime });
      return '--:-- - --:--';
    }
    
    const end = new Date(start.getTime() + duration * 60000);
    return `${format(start, 'HH:mm', { locale: ru })} - ${format(end, 'HH:mm', { locale: ru })}`;
  } catch (error) {
    console.error('Error formatting time range:', error);
    return '--:-- - --:--';
  }
}

export default function UserSchedule() {
  const { user } = useAuth()
  const [schedule, setSchedule] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null)

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const handlePrevWeek = () => {
    setCurrentDate(prev => addDays(prev, -7))
  }

  const handleNextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7))
  }

  useEffect(() => {
    const loadSchedule = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const data = await BidsService.getUserSchedule(user.id)
        setSchedule(data)
      } catch (err: any) {
        setError(err.message || 'Ошибка при загрузке расписания')
      } finally {
        setIsLoading(false)
      }
    }

    loadSchedule()
  }, [user])

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    )
  }

  if (schedule.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Нет запланированных тренировок
        </h3>
        <p className="text-gray-600">
          Записаться на тренировку можно в разделе услуг
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Мое расписание</h2>
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
                      .filter(item => item.schedule && isSameDay(new Date(item.schedule.date), day))
                      .map(item => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedBid(item)}
                          className={`w-full p-2 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                            item.status === 'active' 
                              ? 'bg-green-50'
                              : 'bg-red-50'
                          }`}
                        >
                          <div className="text-gray-900 font-medium">
                            {item.schedule && formatTimeRange(
                              item.schedule.date,
                              item.schedule.startTime,
                              item.schedule.service.duration
                            )}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.schedule?.service.name}
                          </div>
                        </div>
                      ))}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <BidDetailsModal
        bid={selectedBid}
        isOpen={!!selectedBid}
        onClose={() => setSelectedBid(null)}
      />
    </div>
  )
} 