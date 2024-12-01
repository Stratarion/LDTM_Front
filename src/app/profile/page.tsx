'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/layout/Header'
import { User, Settings, Calendar, Building2, Users, BookOpen } from 'lucide-react'
import PersonalData from '@/components/features/profile/PersonalData'
import UserLessons from '@/components/features/profile/UserLessons'
import AdminUsers from '@/components/features/profile/AdminUsers'
import ProviderOrganizations from '@/components/features/profile/ProviderOrganizations'
import ProviderServices from '@/components/features/profile/ProviderServices'
import ProviderSchedule from '@/components/features/profile/ProviderSchedule'

export default function ProfilePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('personal')

  const getMenuItems = () => {
    switch (user?.userType) {
      case 'admin':
        return [
          { id: 'personal', label: 'Личные данные', icon: User },
          { id: 'requests', label: 'Заявки', icon: Settings },
          { id: 'organizations', label: 'Организации', icon: Building2 },
          { id: 'users', label: 'Пользователи', icon: Users },
        ]
      case 'provider':
        return [
          { id: 'personal', label: 'Личные данные', icon: User },
          { id: 'services', label: 'Услуги', icon: BookOpen },
          { id: 'organizations', label: 'Организации', icon: Building2 },
          { id: 'schedule', label: 'Расписание', icon: Calendar },
        ]
      default: // user
        return [
          { id: 'personal', label: 'Личные данные', icon: User },
          { id: 'lessons', label: 'Мои занятия', icon: BookOpen },
        ]
    }
  }

  const menuItems = getMenuItems()

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return user ? <PersonalData user={user} /> : null
      case 'lessons':
        return <UserLessons />
      case 'users':
        return <AdminUsers />
      case 'organizations':
        return <ProviderOrganizations />
      case 'services':
        return <ProviderServices />
      case 'schedule':
        return <ProviderSchedule />
      default:
        return <div>В разработке...</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-200">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Информация о пользователе */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
              <img
                src={user?.avatar_url || "https://picsum.photos/200"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-8">
          {/* Боковое меню */}
          <div className="col-span-1">
            <div className="bg-white rounded-2xl shadow-sm">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
                    activeTab === item.id
                      ? 'bg-gray-50 text-[#5CD2C6]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Контент */}
          <div className="col-span-3 bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h2>
            
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
} 