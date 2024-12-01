'use client'

import { Star, Users, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Sport } from '@/services/sports.service'

interface SportCardProps {
  sport: Sport
}

export default function SportCard({ sport }: SportCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/sports/${sport.id}`}>
        <div className="cursor-pointer">
          <div className="relative h-48 rounded-t-2xl overflow-hidden bg-gray-100">
            <Image
              src={sport.avatar || "https://picsum.photos/400/300"}
              alt={sport.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                {sport.name}
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm ${
                sport.schoolType === 'state' 
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-purple-50 text-purple-600'
              }`}>
                {sport.schoolType === 'state' ? 'Государственная' : 'Частная'}
              </span>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">
              {sport.description}
            </p>

            <div className="flex items-center gap-4 mb-3">
              {sport.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{sport.rating.toFixed(1)}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-gray-500">
                <Users className="w-4 h-4" />
                <span>до {sport.maxStudents} детей</span>
              </div>
              {sport.schedule && (
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{sport.schedule.timeStart.slice(0, 5)} - {sport.schedule.timeEnd.slice(0, 5)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-500">
                {sport.ageFrom}-{sport.ageTo} лет
              </div>
              {sport.price && (
                <div>
                  <span className="text-gray-500">Стоимость в месяц: </span>
                  <span className="font-medium text-gray-900">
                    ~{sport.price.toLocaleString()} ₽
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 text-sm text-gray-500 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span>{sport.reviewCount || 0} отзывов</span>
              </div>
              <div className="text-gray-600">{sport.address}</div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
} 