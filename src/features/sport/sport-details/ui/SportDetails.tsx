'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Header from '@/widgets/Header'
import SportGallery from '@/features/sport/SportGallery'
import SportInfo from '@/features/sport/SportInfo'
import SportFeatures from '@/features/sport/SportFeatures'
import SportReviews from '@/features/sport/SportReviews'
import { useAuth } from '@/shared/lib/hooks/useAuth'
import { ServicesService } from '@/services/services.service'
import { Schedule, ScheduleService } from '@/services/schedule.service'
import SportSchedule from '@/features/sport/SportSchedule'
import { Service } from '@/shared/types/service'
import { ISport } from '@/shared/types/sport'
import { SportDetailsService } from '../api'

export const SportDetails = ({ id }: { id: string }) => {
  const { isAuthenticated } = useAuth()
  const [sport, setSport] = useState<ISport | null>(null)
  const [service, setService] = useState<Service | null>(null)
  const [schedule, setSchedule] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [sportData, serviceData, scheduleData] = await Promise.all([
          SportDetailsService.getSportById(id as string),
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
		<div className="space-y-8">
			<SportGallery sport={sport} />
			<SportInfo sport={sport} />
			{sport.features && <SportFeatures features={sport.features} />}
			<SportReviews reviews={sport.reviews} sportId={sport.id} />

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
  )
} 