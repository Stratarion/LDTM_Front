'use client'

import { useEffect, useState } from 'react'
import { User } from '@/shared/types/user'
import { UsersService } from '@/services/users.service'
import EditUserModal from './EditUserModal'

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const fetchUsers = async (page: number) => {
    try {
      setIsLoading(true)
      const response = await UsersService.getUserList(page)
      setUsers(response.data)
      setCurrentPage(response.pagination.currentPage)
      setTotalPages(response.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(1)
  }, [])

  const handleEditClick = (user: User) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleEditModalClose = () => {
    setSelectedUser(null)
    setIsEditModalOpen(false)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Пользователь
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Контакты
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус аккаунта
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Уведомления
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Создан
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Обновлен
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Последний вход
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                      <img
                        src={user.avatar || "https://picsum.photos/200"}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {`${user.first_name} ${user.last_name}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.role}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                  <div className="text-sm text-gray-500">{user.phone || '—'}</div>
                  <div className="text-sm text-gray-500">{user.address || '—'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                    ${user.status === 'active' ? 'bg-green-100 text-green-800' : 
                      user.status === 'blocked' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {user.status === 'active' ? 'Активен' : 
                     user.status === 'blocked' ? 'Заблокирован' : 
                     user.status === 'inactive' ? 'Неактивен' : user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                    ${user.email_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {user.email_verified ? 'Подтвержден' : 'Не подтвержден'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                    ${user.notifications_enabled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.notifications_enabled ? 'Включены' : 'Выключены'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(user.created_at)}</div>
                  <div className="text-sm text-gray-500">{formatTime(user.created_at)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(user.updated_at)}</div>
                  <div className="text-sm text-gray-500">{formatTime(user.updated_at)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(user.last_login)}</div>
                  <div className="text-sm text-gray-500">{formatTime(user.last_login)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button 
                    onClick={() => handleEditClick(user)}
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
          onClick={() => fetchUsers(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          Назад
        </button>
        <span className="py-2 px-4">
          Страница {currentPage} из {totalPages}
        </span>
        <button
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => fetchUsers(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
        >
          Вперед
        </button>
      </div>

      <EditUserModal
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSuccess={() => {
          fetchUsers(currentPage)
          handleEditModalClose()
        }}
      />
    </div>
  )
} 