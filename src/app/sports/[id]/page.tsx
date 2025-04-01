'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import SportGallery from '@/components/features/sport/SportGallery'
import SportInfo from '@/components/features/sport/SportInfo'
import SportFeatures from '@/components/features/sport/SportFeatures'
import SportReviews from '@/components/features/sport/SportReviews'
import { Sport, SportsService } from '@/services/sports.service'
import { useAuth } from '@/hooks/useAuth'
import { ServicesService } from '@/services/services.service'
import { Schedule, ScheduleService } from '@/services/schedule.service'
import SportSchedule from '@/components/features/sport/SportSchedule'
import { Service } from '@/types/service'

export default function SportPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [sport, setSport] = useState<Sport | null>(null)
  const [service, setService] = useState<Service | null>(null)
  const [schedule, setSchedule] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [sportData, serviceData, scheduleData] = await Promise.all([
          SportsService.getSportById(id as string),
          ServicesService.getServiceById(id as string),
          isAuthenticated ? ScheduleService.getScheduleByServiceId(id as string) : Promise.resolve([])
        ])
        
        setSport(sportData)
        setService(serviceData)
        setSchedule(scheduleData)
      } catch (err: any) {
        setError(err.message || 'Ошибка при загрузке данных')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id, isAuthenticated])

  const handleBack = () => {
    // Получаем сохраненные фильтры из localStorage
    const savedFilters = localStorage.getItem('sportFilters')
    
    if (savedFilters) {
      // Если есть сохраненные фильтры, используем их
      router.replace(`/sports${savedFilters}`)
    } else {
      // Если нет сохраненных фильтров, просто возвращаемся к списку
      router.replace('/sports')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-200">
        <Header />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !sport) {
    return (
      <div className="min-h-screen bg-gray-200">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h1 className="text-2xl font-bold text-gray-900">{error || 'Услуга не найдена'}</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-200">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Вернуться к списку</span>
        </button>

        <div className="space-y-8">
          <SportGallery sport={sport} />
          <SportInfo sport={sport} />
          {sport.features && <SportFeatures features={sport.features} />}
          <SportReviews reviews={sport.reviews} sportId={sport.id} />

          {/* Заменим блок расписания на новый компонент */}
          {isAuthenticated ? (
            <SportSchedule 
              schedule={schedule} 
              service={service}
              isLoading={isLoading} 
            />
          ) : (
            <div className="bg-blue-50 text-blue-700 p-4 rounded-lg">
              Для просмотра расписания необходимо <button className="font-medium underline">войти</button> в систему
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 