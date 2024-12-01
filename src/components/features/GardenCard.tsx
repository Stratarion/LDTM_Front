'use client'

import { useState } from 'react'
import { Star, Building2, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Garden } from '@/services/gardens.service'

interface GardenCardProps {
  garden: Garden
}

export default function GardenCard({ garden }: GardenCardProps) {
  const [imageError, setImageError] = useState(false)

  const defaultImage = "https://picsum.photos/400/300" // заглушка, если нет изображения

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/gardens/${garden.id}`}>
        <div className="cursor-pointer">
          <div className="relative h-48 rounded-t-2xl overflow-hidden bg-gray-100">
            {!imageError ? (
              <Image
                src={garden.avatar || defaultImage}
                alt={garden.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                onError={() => setImageError(true)}
                priority={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                {garden.name}
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm ${
                garden.schoolType === 'state' 
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-purple-50 text-purple-600'
              }`}>
                {garden.schoolType === 'state' ? 'Государственный' : 'Частный'}
              </span>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">
              {garden.description}
            </p>

            <div className="flex items-center gap-2 mb-3">
              {garden.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{garden.rating.toFixed(1)}</span>
                </div>
              )}
              {garden.maxCount && (
                <div className="flex items-center gap-1 text-gray-500">
                  <Building2 className="w-4 h-4" />
                  <span>до {garden.maxCount} детей</span>
                </div>
              )}
            </div>

            {garden.costInfo && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Стоимость в месяц</span>
                <span className="font-medium text-gray-900">
                  ~{garden.costInfo.toLocaleString()} ₽
                </span>
              </div>
            )}

            <div className="mt-3 text-sm text-gray-500 flex justify-between items-center">
              <span>{garden.reviewCount || 0} отзывов</span>
              <span className="text-gray-600">{garden.address}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
} 