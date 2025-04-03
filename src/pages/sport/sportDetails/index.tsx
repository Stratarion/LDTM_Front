'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Header from '@/widgets/Header'
import { SportDetails } from '@/features/sport/sport-details'

export const SportDetailsPage = ({ id }: { id: string}) => {
  const router = useRouter()

  const handleBack = () => {
    // Получаем сохраненные фильтры из localStorage
    const savedFilters = localStorage.getItem('sportFilters')
    
    if (savedFilters) {
      // Если есть сохраненные фильтры, используем их
      router.replace(`/sports${savedFilters}`)
    } else {
      // Если нет сохраненных фильтров, просто возвращаемся к списку
      router.replace('/sports')
    }
  }

  return (
    <div className="min-h-screen bg-gray-200">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Вернуться к списку</span>
        </button>
				<SportDetails id={id} />

      </div>
    </div>
  )
} 