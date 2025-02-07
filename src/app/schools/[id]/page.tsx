'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import SchoolGallery from '@/components/features/school/SchoolGallery'
import SchoolInfo from '@/components/features/school/SchoolInfo'
import SchoolFeatures from '@/components/features/school/SchoolFeatures'
import SchoolReviews from '@/components/features/school/SchoolReviews'
import { School, SchoolsService } from '@/services/schools.service'

export default function SchoolPage() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [school, setSchool] = useState<School | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSchool = async () => {
      try {
        const data = await SchoolsService.getSchoolById(id as string)
        setSchool(data)
      } catch (error) {
        console.error('Failed to load school:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSchool()
  }, [id])

  const handleBack = () => {
    // Получаем сохраненные фильтры из localStorage
    const savedFilters = localStorage.getItem('schoolFilters')
    
    if (savedFilters) {
      // Если есть сохраненные фильтры, используем их
      router.replace(`/schools${savedFilters}`)
    } else {
      // Если нет сохраненных фильтров, просто возвращаемся к списку
      router.replace('/schools')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-200">
        <Header />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      </div>
    )
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-gray-200">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h1 className="text-2xl font-bold text-gray-900">Школа не найдена</h1>
        </div>
      </div>
    )
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
          <span>Вернуться к списку школ</span>
        </button>

        <div className="space-y-8">
          <SchoolGallery school={school} />
          <SchoolInfo school={school} />
          <SchoolFeatures features={school.features} />
          <SchoolReviews schoolId={school.id} />
        </div>
      </div>
    </div>
  )
} 