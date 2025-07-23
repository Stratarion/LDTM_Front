'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import SportGallery from '@/features/sport/sport-details/ui/legacy/SportGallery'
import SportInfo from '@/features/sport/sport-details/ui/legacy/SportInfo'
import SportReviews from '@/features/sport/sport-details/ui/legacy/SportReviews'
import { useAuth } from '@/shared/lib/hooks/useAuth'
import { ServicesAPI } from '@/shared/api/services.api'
import { Schedule, ScheduleService } from '@/entities/schedule/schedule.service'
import SportSchedule from '@/features/sport/sport-details/ui/legacy/SportSchedule'
import { IService } from '@/entities/service/model/service'

export const SportDetails = ({ id }: { id: string }) => {
  const { isAuthenticated } = useAuth()
  const [service, setService] = useState<IService | null>(null)
  const [schedule, setSchedule] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [serviceData, scheduleData] = await Promise.all([
          ServicesAPI.getServiceById(id as string),
          isAuthenticated ? ScheduleService.getScheduleByServiceId(id as string) : Promise.resolve([])
        ])
        
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
			<div className="flex justify-center items-center py-20">
				<Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
			</div>
    )
  }

  if (error || !service) {
    return (
			<div className="max-w-7xl mx-auto px-4 py-20">
				<h1 className="text-2xl font-bold text-gray-900">{error || 'Услуга не найдена'}</h1>
			</div>
    )
  }

  return (
		<div className="space-y-8">
			<SportGallery sport={service} />
			<SportInfo sport={service} />
			<SportReviews reviews={service.reviews} sportId={service.id} />

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