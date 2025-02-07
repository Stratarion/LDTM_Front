'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { ReviewsService } from '@/services/reviews.service'
import { useAuth } from '@/hooks/useAuth'

interface AddReviewFormProps {
  sportId: string
  onReviewAdded: () => void
}

export default function AddReviewForm({ sportId, onReviewAdded }: AddReviewFormProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasUserReview, setHasUserReview] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('Необходимо авторизоваться для отправки отзыва')
      return
    }

    if (rating === 0) {
      setError('Пожалуйста, поставьте оценку')
      return
    }

    if (content.length < 10) {
      setError('Отзыв должен содержать минимум 10 символов')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await ReviewsService.createReview({
        content,
        rating,
        serviceId: sportId,
        createrName: user.first_name,
        createrId: user.id,
        createrAvatar: user.avatar || undefined,
        entityType: 'service'
      })

      setContent('')
      setRating(0)
      onReviewAdded()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Произошла ошибка при отправке отзыва')
    } finally {
      setIsLoading(false)
    }
  }

  if (hasUserReview) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800">
        Вы уже оставили отзыв об этой школе
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-blue-50 p-4 rounded-lg text-blue-800">
        Войдите в аккаунт, чтобы оставить отзыв
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Ваша оценка
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1"
            >
              <Star
                className={`w-8 h-8 ${
                  value <= (hoverRating || rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Ваш отзыв
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900 placeholder:text-gray-500"
          placeholder="Расскажите о вашем опыте..."
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#5CD2C6] text-white py-2 rounded-lg hover:bg-[#4BC0B5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Отправка...' : 'Отправить отзыв'}
      </button>
    </form>
  )
} 