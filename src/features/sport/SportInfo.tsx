'use client'

import { Sport } from '@/services/sports.service'
import { Building2, Users, MapPin, Star } from 'lucide-react'

interface SportInfoProps {
  sport: Sport
}

export default function SportInfo({ sport }: SportInfoProps) {
  // Рассчитываем средний рейтинг
  const averageRating = sport.rating && sport.reviews_count 
    ? (sport.rating / sport.reviews_count).toFixed(1) 
    : '0.0'
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{sport.name}</h1>
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
          <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          <div className="flex flex-col items-end">
            <span className="text-xl font-bold text-gray-900">{averageRating}</span>
            <span className="text-sm text-gray-500">{sport.reviews_count || 0} отзывов</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900">Подкатегория</h3>
              <p className="text-gray-600">
                {sport.subcategory || 'неизвестно'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900">Количество учеников в группе/классе</h3>
              <p className="text-gray-600">{sport.max_students} учеников</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900">Адрес</h3>
              <p className="text-gray-600">{sport.address}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-2">Описание</h3>
          <p className="text-gray-600">{sport.description}</p>

          {sport.price && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-900 mb-2">Стоимость занятия</h3>
              <p className="text-gray-600">
                ~{sport.price?.toLocaleString()} ₽/занятие
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 