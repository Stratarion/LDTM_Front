'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { Sport } from '@/services/sports.service'

interface ReviewsProps {
  sportId: string
  readOnly?: boolean
}

export default function Reviews({ sportId, readOnly = false }: ReviewsProps) {
  const [reviews, setReviews] = useState<Sport['reviews']>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Здесь должна быть загрузка отзывов
    setIsLoading(false)
  }, [sportId])

  if (isLoading) {
    return <div>Загрузка отзывов...</div>
  }

  if (!reviews?.length) {
    return <div className="text-gray-500">Отзывов пока нет</div>
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{review.author}</span>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-600">{review.text}</p>
        </div>
      ))}
    </div>
  )
} 