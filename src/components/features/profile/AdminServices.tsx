'use client'

import { useEffect, useState } from 'react'
import { Service, ServiceFilters, ServiceCategory, ServiceStatus } from '@/types/service'
import { ServicesService } from '@/services/services.service'
import { useDebounce } from '@/hooks/useDebounce'

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)
  
  const [filters, setFilters] = useState<ServiceFilters>({
    name: '',
    category: undefined,
    status: undefined,
    minPrice: undefined,
    maxPrice: undefined
  })

  const debouncedFilters = useDebounce(filters, 500)

  const fetchServices = async (page: number, filters: ServiceFilters) => {
    try {
      setIsLoading(true)
      const response = await ServicesService.getAdminList(page, filters)
      setServices(response.data)
      setCurrentPage(response.currentPage)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchServices(currentPage, debouncedFilters)
  }, [currentPage, debouncedFilters])

  const handleBulkActivate = async () => {
    if (selectedIds.length === 0) return

    try {
      setIsBulkUpdating(true)
      await ServicesService.activateService(selectedIds)
      await fetchServices(currentPage, filters)
      setSelectedIds([])
    } catch (error) {
      console.error('Error activating services:', error)
    } finally {
      setIsBulkUpdating(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(services.map(service => service.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(serviceId => serviceId !== id))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: ServiceStatus) => {
    switch (status) {
      case 'active':
        return 'Активна'
      case 'inactive':
        return 'Неактивна'
      case 'pending':
        return 'На рассмотрении'
      case 'rejected':
        return 'Отклонена'
      default:
        return status
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-700">Фильтры</h3>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Выбрано: {selectedIds.length}
              </span>
              <button
                onClick={handleBulkActivate}
                disabled={isBulkUpdating}
                className="px-3 py-1 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                {isBulkUpdating ? 'Активация...' : 'Активировать'}
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Название</label>
            <input
              type="text"
              value={filters.name}
              onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
              placeholder="Поиск по названию"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Категория</label>
            <select
              value={filters.category || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, category: (e.target.value || undefined) as ServiceCategory }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
            >
              <option value="">Все категории</option>
              <option value="sport">Спорт</option>
              <option value="art">Искусство</option>
              <option value="education">Образование</option>
              <option value="other">Другое</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Статус</label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, status: (e.target.value || undefined) as ServiceStatus }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
            >
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
              <option value="pending">На рассмотрении</option>
              <option value="rejected">Отклоненные</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Цена от</label>
            <input
              type="number"
              value={filters.minPrice || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value ? Number(e.target.value) : undefined }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
              placeholder="Минимальная цена"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Цена до</label>
            <input
              type="number"
              value={filters.maxPrice || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value ? Number(e.target.value) : undefined }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
              placeholder="Максимальная цена"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedIds.length === services.length && services.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-[#5CD2C6] focus:ring-[#5CD2C6] border-gray-300 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Услуга
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Категория
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Контакты
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Цена
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Длительность
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Возраст
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ученики
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Рейтинг
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(service.id)}
                    onChange={(e) => handleSelectOne(service.id, e.target.checked)}
                    className="h-4 w-4 text-[#5CD2C6] focus:ring-[#5CD2C6] border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={service.image || "https://picsum.photos/200"}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-500">{service.description || '—'}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs" title={service.address.full}>
                        {service.address.full}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{service.category}</div>
                  {service.subcategory && (
                    <div className="text-sm text-gray-500">{service.subcategory}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="text-gray-900">{service.phone || '—'}</div>
                    <div className="text-gray-500">{service.email || '—'}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{Number(service.price).toLocaleString('ru-RU')} ₽</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{service.duration} мин.</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{service.age_from}-{service.age_to} лет</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">До {service.max_students}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="text-gray-900">{service.avgRating.toFixed(1)}</div>
                    <div className="text-gray-500">{service.reviews_count} отзывов</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(service.status)}`}>
                    {getStatusText(service.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(service.createdAt)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        <button
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setCurrentPage(prev => prev - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          Назад
        </button>
        <span className="py-2 px-4">
          Страница {currentPage} из {totalPages}
        </span>
        <button
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={currentPage === totalPages || isLoading}
        >
          Вперед
        </button>
      </div>
    </div>
  )
} 