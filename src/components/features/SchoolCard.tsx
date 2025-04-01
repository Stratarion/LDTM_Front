'use client'

import Image from 'next/image'
import { Building2 } from 'lucide-react'
import { School } from '@/services/schools.service'
import { useRouter } from 'next/navigation'

interface SchoolCardProps {
  school: School
}

export default function SchoolCard({ school }: SchoolCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/schools/${school.id}`)
  }

  return (
    <div
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {school.avatar ? (
              <Image
                src={school.avatar}
                alt={school.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <Building2 className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {school.name}
                </h3>
                <p className="text-gray-600 mt-1">{school.address}</p>
              </div>
              {school.cost_info && school.school_type === 'private' && (
                <span className="px-3 py-1 rounded-full text-sm bg-amber-50 text-amber-600">
                  ~{school.cost_info.toLocaleString()} ₽/месяц
                </span>
              )}
            </div>

            {school.description && (
              <p className="text-gray-600 mt-2 line-clamp-2">
                {school.description}
              </p>
            )}

            <div className="flex items-center gap-4 mt-3">
              {school.totalRating && school.reviewCount ? (
                <span className="text-sm text-gray-600">
                  ⭐ {(school.totalRating / school.reviewCount).toFixed(1)} ({school.reviewCount})
                </span>
              ) : null}
              
              <span className="text-sm text-gray-600">
                {school.type === 'school' ? 'Школа' : 'Детский сад'}
              </span>

              {school.school_type && (
                <span className="text-sm text-gray-600">
                  {school.school_type === 'state' ? 'Государственная' : 'Частная'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 