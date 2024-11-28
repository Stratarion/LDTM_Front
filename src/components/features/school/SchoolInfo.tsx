'use client'

import { School } from '@/services/schools.service'
import { Building2, Users, MapPin, Star } from 'lucide-react'

interface SchoolInfoProps {
  school: School
}

export default function SchoolInfo({ school }: SchoolInfoProps) {
  // Рассчитываем средний рейтинг
  const averageRating = school.totalRating && school.reviewCount 
    ? (school.totalRating / school.reviewCount).toFixed(1) 
    : '0.0'

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{school.name}</h1>
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
          <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          <div className="flex flex-col items-end">
            <span className="text-xl font-bold text-gray-900">{averageRating}</span>
            <span className="text-sm text-gray-500">{school.reviewCount || 0} отзывов</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900">Тип школы</h3>
              <p className="text-gray-600">
                {school.schoolType === 'state' ? 'Государственная' : 'Частная'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900">Количество учеников в группе/классе</h3>
              <p className="text-gray-600">{school.maxCount} учеников</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900">Адрес</h3>
              <p className="text-gray-600">{school.address}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-2">Описание</h3>
          <p className="text-gray-600">{school.description}</p>
          
          {school.approach && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-900 mb-2">Подход к обучению</h3>
              <p className="text-gray-600">{school.approach}</p>
            </div>
          )}

          {school.schoolType === 'private' && school.costInfo && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-900 mb-2">Стоимость обучения</h3>
              <p className="text-gray-600">
                ~{school.costInfo?.toLocaleString()} ₽/месяц
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 