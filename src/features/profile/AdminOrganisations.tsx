'use client'

import { useEffect, useState } from 'react'
import { Organisation, OrganisationFilters, OrganisationType, OrganisationStatus, SchoolType } from '@/shared/types/organisation'
import { OrganisationsService } from '@/services/organisations.service'
import { useDebounce } from '@/shared/lib/hooks/useDebounce'
import EditOrganisationModal from './EditOrganisationModal'

export default function AdminOrganisations() {
  const [organisations, setOrganisations] = useState<Organisation[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOrganisation, setSelectedOrganisation] = useState<Organisation | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)
  
  const [filters, setFilters] = useState<OrganisationFilters>({
    name: '',
    type: undefined,
    status: undefined,
    address: '',
    school_type: undefined
  })

  const debouncedFilters = useDebounce(filters, 500)

  const fetchOrganisations = async (page: number, filters: OrganisationFilters) => {
    try {
      setIsLoading(true)
      const response = await OrganisationsService.getAdminList(page, filters)
      setOrganisations(response.data)
      setCurrentPage(response.currentPage)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error('Error fetching organisations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrganisations(currentPage, debouncedFilters)
  }, [currentPage, debouncedFilters])

  const handleEditClick = (org: Organisation) => {
    setSelectedOrganisation(org)
    setIsEditModalOpen(true)
  }

  const handleEditModalClose = () => {
    setSelectedOrganisation(null)
    setIsEditModalOpen(false)
  }

  const handleBulkStatusUpdate = async () => {
    if (selectedIds.length === 0) return

    try {
      setIsBulkUpdating(true)
      await OrganisationsService.activateOrganisation(selectedIds)
      await fetchOrganisations(currentPage, filters)
      setSelectedIds([])
    } catch (error) {
      console.error('Error activating organisations:', error)
    } finally {
      setIsBulkUpdating(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(organisations.map(org => org.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(orgId => orgId !== id))
    }
  }

  const getStatusColor = (status: OrganisationStatus) => {
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

  const getStatusText = (status: OrganisationStatus) => {
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

  const getSchoolTypeText = (type: SchoolType) => {
    switch (type) {
      case 'state':
        return 'Государственная'
      case 'private':
        return 'Частная'
      default:
        return 'Другое'
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
                onClick={handleBulkStatusUpdate}
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
            <label className="block text-sm font-medium text-gray-700">Тип</label>
            <select
              value={filters.type || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, type: (e.target.value || undefined) as OrganisationType }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
            >
              <option value="">Все типы</option>
              <option value="school">Школа</option>
              <option value="sport">Спорт</option>
              <option value="art">Искусство</option>
              <option value="other">Другое</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Статус</label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, status: (e.target.value || undefined) as OrganisationStatus }))}
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
            <label className="block text-sm font-medium text-gray-700">Тип школы</label>
            <select
              value={filters.school_type || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, school_type: (e.target.value || undefined) as SchoolType }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
            >
              <option value="">Все типы</option>
              <option value="state">Государственная</option>
              <option value="private">Частная</option>
              <option value="other">Другое</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Адрес</label>
            <input
              type="text"
              value={filters.address || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, address: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
              placeholder="Поиск по адресу"
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
                  checked={selectedIds.length === organisations.length && organisations.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-[#5CD2C6] focus:ring-[#5CD2C6] border-gray-300 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Организация
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Контакты
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Рейтинг
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Информация
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {organisations.map((org) => (
              <tr key={org.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(org.id)}
                    onChange={(e) => handleSelectOne(org.id, e.target.checked)}
                    className="h-4 w-4 text-[#5CD2C6] focus:ring-[#5CD2C6] border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={org.avatar || "https://picsum.photos/200"}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{org.name}</div>
                      <div className="text-xs text-gray-500">{org.type}</div>
                      {org.type === 'school' && (
                        <div className="text-xs text-gray-500">{getSchoolTypeText(org.school_type)}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="text-gray-900">{org.email}</div>
                    <div className="text-gray-500">{org.phone}</div>
                    <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-[#5CD2C6] hover:text-[#4BC0B5]">
                      Сайт
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(org.status)}`}>
                    {getStatusText(org.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="text-gray-900">{org.avgRating.toFixed(1)}</div>
                    <div className="text-gray-500">{org.reviews_count} отзывов</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="text-gray-900">Директор: {org.director_name}</div>
                    <div className="text-gray-500 truncate max-w-xs" title={org.address}>
                      {org.address}
                    </div>
                    <div className="text-gray-500">
                      Макс. количество: {org.max_count}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button 
                    onClick={() => handleEditClick(org)}
                    className="text-[#5CD2C6] hover:text-[#4BC0B5]"
                  >
                    Редактировать
                  </button>
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

      <EditOrganisationModal
        organisation={selectedOrganisation}
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSuccess={() => {
          fetchOrganisations(currentPage, filters)
          handleEditModalClose()
        }}
      />
    </div>
  )
} 