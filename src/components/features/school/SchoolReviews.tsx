'use client'

import { useState, useEffect } from 'react'
import { Star, ThumbsUp, MessageCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { ReviewsService, Review, ReviewsResponse } from '@/services/reviews.service'
import { useAuth } from '@/hooks/useAuth'
import AddReviewForm from './AddReviewForm'

interface SchoolReviewsProps {
  schoolId: string
}

export default function SchoolReviews({ schoolId }: SchoolReviewsProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasUserReview, setHasUserReview] = useState(false)

  const loadReviews = async () => {
    try {
      const response = await ReviewsService.getSchoolReviews(schoolId)
      console.log(response)
      setReviews(response.data || [])
      
      // Проверяем, есть ли отзыв текущего пользователя
      if (user) {
        const userReview = response.data.find(review => review.createrId === user.id)
        setHasUserReview(!!userReview)
      }
    } catch (error) {
      console.error('Failed to load reviews:', error)
      setReviews([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [schoolId, user]) // Добавляем user в зависимости

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Отзывы</h2>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Отзывы</h2>
      
      <div className="space-y-6">
        <div className="border-b border-gray-100 pb-6">
          {!hasUserReview ? (
            <div className="bg-green-50 p-4 rounded-lg text-green-800">
              Ваш отзыв уже учтен, спасибо!
            </div>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Оставить отзыв
              </h3>
              <AddReviewForm schoolId={schoolId} onReviewAdded={loadReviews} />
            </>
          )}
        </div>

        {reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex-shrink-0 border-2 border-gray-300 shadow-sm">
                  {review.createrAvatar ? (
                    <Image
                      src={review.createrAvatar}
                      alt={review.createrName}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#5CD2C6] text-white font-medium">
                      {review.createrName?.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{review.createrName}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`w-4 h-4 ${
                              index < review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <p className="mt-3 text-gray-600">{review.content}</p>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
                      <ThumbsUp className="w-4 h-4" />
                      {review.likesCount}
                    </button>
                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
                      <MessageCircle className="w-4 h-4" />
                      {review.repliesCount}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            Пока нет отзывов. Будьте первым, кто оставит отзыв об этой школе!
          </div>
        )}
      </div>
    </div>
  )
} 