'use client'

import { User, UserRole, UserStatus } from '@/shared/types/user'
import { UsersService } from '@/services/users.service'
import { useEffect, useState } from 'react'

interface EditUserModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditUserModal({ user, isOpen, onClose, onSuccess }: EditUserModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    role: 'user' as UserRole,
    status: 'active' as UserStatus,
    notifications_enabled: false
  })

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        role: user.role,
        status: user.status,
        notifications_enabled: user.notifications_enabled
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setIsLoading(true)
      await UsersService.updateUser(user.id, formData)
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-gray-700 font-semibold">Редактирование пользователя</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Имя</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                className="mt-1 text-gray-700 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Фамилия</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                className="mt-1 text-gray-700 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="mt-1 text-gray-700 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Телефон</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="mt-1 text-gray-700 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Адрес</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="mt-1 text-gray-700 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Роль</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                className="mt-1 text-gray-700 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
              >
                <option value="user">Пользователь</option>
                <option value="admin">Администратор</option>
                <option value="provider">Поставщик</option>
                <option value="teacher">Учитель</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Статус</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as UserStatus }))}
                className="mt-1 text-gray-700 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#5CD2C6] focus:outline-none focus:ring-1 focus:ring-[#5CD2C6]"
              >
                <option value="active">Активен</option>
                <option value="inactive">Неактивен</option>
                <option value="blocked">Заблокирован</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifications"
              checked={formData.notifications_enabled}
              onChange={(e) => setFormData(prev => ({ ...prev, notifications_enabled: e.target.checked }))}
              className="h-4 w-4 text-[#5CD2C6] focus:ring-[#5CD2C6] border-gray-300 rounded"
            />
            <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700">
              Уведомления включены
            </label>
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