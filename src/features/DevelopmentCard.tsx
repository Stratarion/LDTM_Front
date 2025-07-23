'use client'

import Image from 'next/image'
import Link from 'next/link'
import { IService } from '@/entities/service/model/service'
import { Star, Users } from 'lucide-react'

interface DevelopmentCardProps {
  service: IService
}

export default function DevelopmentCard({ service }: DevelopmentCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <Link href={`/development/${service.id}`}>
        <div className="flex gap-4 p-4">
          <div className="w-48 h-32 relative rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={service.image || '/placeholder.jpg'}
              alt={service.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {service.subcategory}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-gray-900">
                  {Number(service.price).toLocaleString('ru-RU')} ₽
                </p>
                <p className="text-sm text-gray-500">за занятие</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>{service.rating.toFixed(1)} ({service.reviews_count})</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{service.age_from}-{service.age_to} лет</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
} 