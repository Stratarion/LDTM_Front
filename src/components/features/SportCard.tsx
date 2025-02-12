'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Sport } from '@/services/sports.service'
import { Star, Users } from 'lucide-react'

interface SportCardProps {
  sport: Sport
}

export default function SportCard({ sport }: SportCardProps) {
  
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <Link href={`/sports/${sport.id}`}>
        <div className="flex gap-4 p-4">
          <div className="w-48 h-32 relative rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={sport.image || '/placeholder.jpg'}
              alt={sport.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {sport.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {sport.subcategory}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-gray-900">
                  {Number(sport.price).toLocaleString('ru-RU')} ₽
                </p>
                <p className="text-sm text-gray-500">за занятие</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>{sport.rating.toFixed(1)} ({sport.reviews_count})</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{sport.age_from}-{sport.age_to} лет</span>
              </div>
            </div>

            <div className="mt-2 text-sm text-gray-600">
              {sport.address}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
} 