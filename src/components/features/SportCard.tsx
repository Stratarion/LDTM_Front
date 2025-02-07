'use client'

import { Building2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Service } from '@/services/services.service'

interface SportCardProps {
  sport: Service
}

export default function SportCard({ sport }: SportCardProps) {
  
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <Link href={`/sports/${sport.id}`}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {sport.image ? (
                <Image
                  src={sport.image}
                  alt={sport.name}
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
                    {sport.name}
                  </h3>
                  <p className="text-gray-600 mt-1">{sport.address}</p>
                </div>
                {sport.price && (
                  <span className="px-3 py-1 rounded-full text-sm bg-amber-50 text-amber-600">
                    ~{sport.price.toLocaleString()} ₽/месяц
                  </span>
                )}
              </div>

              {sport.description && (
                <p className="text-gray-600 mt-2 line-clamp-2">
                  {sport.description}
                </p>
              )}

              <div className="flex items-center gap-4 mt-3">
                <span className="text-sm text-gray-600">
                  ⭐ {(sport.reviews_count && sport.rating) ? (sport.rating / sport.reviews_count).toFixed(1) : 0} ({sport.reviews_count})
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
} 