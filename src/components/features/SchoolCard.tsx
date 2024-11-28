'use client'

import { Star, Building2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { School } from '@/services/schools.service'

interface SchoolCardProps {
  school: School
}

export default function SchoolCard({ school }: SchoolCardProps) {
  const hasAvatar = Boolean(school.avatar)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        <Link 
          href={`/schools/${school.id}`}
          className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center"
        >
          {hasAvatar ? (
            <Image
              src={school.avatar}
              alt={school.name}
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          ) : (
            <Building2 className="w-12 h-12 text-gray-400" />
          )}
        </Link>

        <div className="flex-grow">
          <div className="flex items-start justify-between gap-4">
            <Link href={`/schools/${school.id}`}>
              <h3 className="text-xl font-bold text-gray-900 hover:text-[#5CD2C6] transition-colors">
                {school.name}
              </h3>
            </Link>
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-medium text-gray-900">
                {(school.totalRating / school.reviewCount)?.toFixed(1) || '0.0'}
              </span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {school.description || 'Описание отсутствует'}
          </p>

          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`px-3 py-1 rounded-full text-sm ${
              school.schoolType === 'state' 
                ? 'bg-blue-50 text-blue-600' 
                : 'bg-purple-50 text-purple-600'
            }`}>
              {school.schoolType === 'state' ? 'Государственная' : 'Частная'}
            </span>
            <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
              {school.maxCount || 0} учеников в группе/классе
            </span>
            {school.approach && (
              <span className="px-3 py-1 rounded-full text-sm bg-green-50 text-green-600">
                {school.approach}
              </span>
            )}
            {school.schoolType === 'private' && school.costInfo && (
              <span className="px-3 py-1 rounded-full text-sm bg-amber-50 text-amber-600">
                ~{school.costInfo?.toLocaleString()} ₽/месяц
              </span>
            )}
          </div>

          <div className="mt-3 text-sm text-gray-500 flex justify-between items-center">
            <span>{school.reviewCount || 0} отзывов</span>
            <span className="text-gray-600">{school.address}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 