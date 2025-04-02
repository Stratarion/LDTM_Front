'use client'

import { Organisation, OrganisationType, OrganisationStatus, SchoolType } from '@/shared/types/organisation'
import { OrganisationsService } from '@/services/organisations.service'
import { useEffect, useState } from 'react'

interface EditOrganisationModalProps {
  organisation: Organisation | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditOrganisationModal({
  organisation,
  isOpen,
  onClose,
  onSuccess
}: EditOrganisationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'school' as OrganisationType,
    status: 'active' as OrganisationStatus,
    address: '',
    description: '',
    director_name: '',
    email: '',
    phone: '',
    website: '',
    max_count: 0,
    school_type: 'state' as SchoolType,
    approach: ''
  })

  useEffect(() => {
    if (organisation) {
      setFormData({
        name: organisation.name,
        type: organisation.type,
        status: organisation.status,
        address: organisation.address,
        description: organisation.description,
        director_name: organisation.director_name,
        email: organisation.email,
        phone: organisation.phone,
        website: organisation.website,
        max_count: organisation.max_count,
        school_type: organisation.school_type,
        approach: organisation.approach
      })
    }
  }, [organisation])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organisation) return

    try {
      setIsLoading(true)
      await OrganisationsService.updateOrganisation(organisation.id, formData)
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating organisation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !organisation) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-gray-700 font-semibold">Редактирование организации</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Название</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Тип</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as OrganisationType }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
              >
                <option value="school">Школа</option>
                <option value="sport">Спорт</option>
                <option value="art">Искусство</option>
                <option value="other">Другое</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Статус</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as OrganisationStatus }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
              >
                <option value="active">Активна</option>
                <option value="inactive">Неактивна</option>
                <option value="pending">На рассмотрении</option>
                <option value="rejected">Отклонена</option>
              </select>
            </div>
          </div>

          {formData.type === 'school' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Тип школы</label>
              <select
                value={formData.school_type}
                onChange={(e) => setFormData(prev => ({ ...prev, school_type: e.target.value as SchoolType }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
              >
                <option value="state">Государственная</option>
                <option value="private">Частная</option>
                <option value="other">Другое</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">ФИО директора</label>
            <input
              type="text"
              value={formData.director_name}
              onChange={(e) => setFormData(prev => ({ ...prev, director_name: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Телефон</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Сайт</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Адрес</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Подход</label>
            <input
              type="text"
              value={formData.approach}
              onChange={(e) => setFormData(prev => ({ ...prev, approach: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Максимальное количество учеников</label>
            <input
              type="number"
              value={formData.max_count}
              onChange={(e) => setFormData(prev => ({ ...prev, max_count: Number(e.target.value) }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#5CD2C6] rounded-md hover:bg-[#4BC0B5] disabled:opacity-50"
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 