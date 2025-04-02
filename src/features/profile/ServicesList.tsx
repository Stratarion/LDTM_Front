'use client'

import { useEffect, useState } from 'react'
import { ServicesService } from '@/services/services.service'
import { useAuth } from '@/shared/lib/hooks/useAuth'
import { Service } from '@/shared/types/service'

export default function ServicesList() {
  const { user } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadServices = async () => {
      if (!user) return
      try {
        const sportServices = await ServicesService.getUserServices(user.id, 'sport')
        const developmentServices = await ServicesService.getUserServices(user.id, 'development')
        setServices([...sportServices, ...developmentServices])
      } catch (err) {
        console.error('Failed to load services:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadServices()
  }, [user])

  if (isLoading) {
    return <div>Загрузка...</div>
  }

  return (
    <div className="space-y-4">
      {services.map(service => (
        <div key={service.id} className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{service.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{service.description}</p>
              <div className="mt-2 text-sm text-gray-500">
                <div>Цена: {service.price} ₽</div>
                <div>Возраст: {service.age_from}-{service.age_to} лет</div>
                <div>Макс. участников: {service.max_students}</div>
                <div>Адрес: {service.address.full}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 