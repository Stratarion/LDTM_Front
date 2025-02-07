'use client'

import { useState, useEffect } from 'react'
import { Plus, Dumbbell, Brain, Loader2 } from 'lucide-react'
import { Service, ServiceType, ServicesService } from '@/services/services.service'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import AddServiceForm from './AddServiceForm'
import ServiceDetailsModal from './ServiceDetailsModal'
import { mockGalleryImages } from '@/mock/galleryImages'

export default function ProviderServices() {
  const { user } = useAuth()
  const { showNotification } = useNotifications()
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [activeType, setActiveType] = useState<ServiceType>('sport')
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const loadServices = async () => {
    if (!user) return
    
    try {
      const data = await ServicesService.getUserServices(user.id, activeType)
      setServices(data)
    } catch (err) {
      setError('Не удалось загрузить услуги')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [user, activeType])

  const handleDelete = async (id: string) => {
    try {
      await ServicesService.deleteService(id)
      setServices(services.filter(service => service.id !== id))
      setSelectedService(null)
      showNotification({
        title: 'Успешно',
        message: 'Услуга была уд��лена',
        type: 'success'
      })
    } catch (err) {
      showNotification({
        title: 'Ошибка',
        message: 'Не удалось удалить услугу',
        type: 'error'
      })
    }
  }

  const handleEdit = async (id: string) => {
    await loadServices()
  }

  // Преобразование Service в Sport для совместимости с OrganizationDetailsModal
  const serviceToSport = (service: Service) => ({
    id: service.id,
    name: service.name,
    description: service.description,
    type: service.category,
    images: mockGalleryImages,
    rating: service.rating || 0,
    address: service.address,
    duration: service.duration,
    maxStudents: service.max_students,
    ageRange: [service.age_from, service.age_to] as [number, number],
    price: service.price,
    reviews: service.reviews || []
  })

  const filteredServices = services.filter(service => service.category === activeType)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Переключатель типа услуг */}
      <div className="flex justify-center bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveType('sport')}
          className={`flex items-center gap-2 flex-1 px-4 py-2 rounded-md transition-colors ${
            activeType === 'sport'
              ? 'bg-white text-[#5CD2C6] shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Dumbbell className="w-5 h-5" />
          Спорт
        </button>
        <button
          onClick={() => setActiveType('development')}
          className={`flex items-center gap-2 flex-1 px-4 py-2 rounded-md transition-colors ${
            activeType === 'development'
              ? 'bg-white text-[#5CD2C6] shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Brain className="w-5 h-5" />
          Развитие
        </button>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Мои услуги
        </h3>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#5CD2C6] text-white rounded-lg hover:bg-[#4BC0B5] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Добавить услугу
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:border-[#5CD2C6] transition-colors cursor-pointer"
              onClick={() => setSelectedService(service)}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {service.name}
                  </h4>
                  <p className="text-gray-600 mt-1">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-sm text-gray-500">
                      {service.duration} мин
                    </span>
                    <span className="text-sm text-gray-500">
                      до {service.max_students} учеников
                    </span>
                    <span className="text-sm text-gray-500">
                      {service.age_from}-{service.age_to} лет
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-sm bg-green-50 text-green-600">
                  {service.price.toLocaleString()} ₽/занятие
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            {activeType === 'sport' ? <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" /> : <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />}
            <p className="text-gray-600">
              У вас пока нет услуг данного типа. Добавьте первую!
            </p>
          </div>
        )}
      </div>

      <AddServiceForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false)
          loadServices()
        }}
        initialType={activeType}
      />

      {selectedService && (
        <ServiceDetailsModal
          serviceId={selectedService.id}
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
    </div>
  )
}
