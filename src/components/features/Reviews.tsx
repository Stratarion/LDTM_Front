'use client'

import { useState, useEffect } from 'react'

interface ReviewsProps {
  sportId: string
}

export default function Reviews({ sportId }: ReviewsProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Здесь должна быть загрузка отзывов
    setIsLoading(false)
  }, [sportId])

  if (isLoading) {
    return <div>Загрузка отзывов...</div>
  }

  return (
    <div className="space-y-4">
      Отзывы в работе
    </div>
  )
} 