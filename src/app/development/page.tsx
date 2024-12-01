'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import DevelopmentCard from '@/components/features/DevelopmentCard'
import { Development, DevelopmentService, DevelopmentFiltersType } from '@/services/development.service'
import DevelopmentFilters from '@/components/features/DevelopmentFilters'

// Функция для преобразования строки в массив чисел [min, max]
const parsePriceRange = (range: string | null): [number, number] | undefined => {
  if (!range) return undefined
  const [min, max] = range.split('-').map(Number)
  if (isNaN(min) || isNaN(max)) return undefined
  return [min, max]
}

const parseAgeRange = (range: string | null): [number, number] | undefined => {
  if (!range) return undefined
  const [min, max] = range.split('-').map(Number)
  if (isNaN(min) || isNaN(max)) return undefined
  return [min, max]
}

const DevelopmentList = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [developments, setDevelopments] = useState<Development[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const initialFetchRef = useRef(false)

  // Получаем фильтры из URL
  const filters: DevelopmentFiltersType = {
    type: (searchParams.get('type') as DevelopmentFiltersType['type']) || 'all',
    name: searchParams.get('name') || undefined,
    minRating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
    priceRange: parsePriceRange(searchParams.get('price')),
    city: searchParams.get('city') || undefined,
    ageRange: parseAgeRange(searchParams.get('age')),
    developmentType: (searchParams.get('developmentType') as DevelopmentFiltersType['developmentType']) || undefined,
    maxParticipants: searchParams.get('maxParticipants') ? Number(searchParams.get('maxParticipants')) : undefined
  }

  // Загрузка данных
  const loadDevelopments = useCallback(async (pageNum: number) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await DevelopmentService.getDevelopments(pageNum, 12, filters)
      
      if (pageNum === 1) {
        setDevelopments(response.data)
      } else {
        setDevelopments(prev => [...prev, ...response.data])
      }
      
      setHasMore(pageNum < response.totalPages)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Произошла ошибка при загрузке данных'
      setError(errorMessage)
      setHasMore(false)
      console.error('Failed to load developments:', err)
    } finally {
      setIsLoading(false)
      setIsInitialLoad(false)
    }
  }, [filters])

  // Первичная загрузка
  useEffect(() => {
    if (!initialFetchRef.current) {
      initialFetchRef.current = true
      setPage(1)
      loadDevelopments(1)
    }
  }, [loadDevelopments])

  // Intersection Observer для бесконечной прокрутки
  const { ref, inView } = useInView({
    threshold: 0
  })

  useEffect(() => {
    if (inView && !isLoading && hasMore && !isInitialLoad) {
      setPage(prev => prev + 1)
      loadDevelopments(page + 1)
    }
  }, [inView, isLoading, hasMore, loadDevelopments, page, isInitialLoad])

  // Обработчик изменения фильтров
  const handleFilterChange = (newFilters: DevelopmentFiltersType) => {
    const params = new URLSearchParams()
    
    if (newFilters.type && newFilters.type !== 'all') params.set('type', newFilters.type)
    if (newFilters.name) params.set('name', newFilters.name)
    if (newFilters.minRating) params.set('rating', String(newFilters.minRating))
    if (newFilters.priceRange) params.set('price', `${newFilters.priceRange[0]}-${newFilters.priceRange[1]}`)
    if (newFilters.city) params.set('city', newFilters.city)
    if (newFilters.ageRange) params.set('age', `${newFilters.ageRange[0]}-${newFilters.ageRange[1]}`)
    if (newFilters.developmentType) params.set('developmentType', newFilters.developmentType)
    if (newFilters.maxParticipants) params.set('maxParticipants', String(newFilters.maxParticipants))

    router.push(`/development${params.toString() ? '?' + params.toString() : ''}`)
  }

  // Компонент для отображения ошибки
  const ErrorMessage = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 text-red-700">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
      <button 
        onClick={() => {
          setError(null)
          loadDevelopments(1)
        }}
        className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
      >
        Попробовать снова
      </button>
    </div>
  )

  // Компонент для пустого состояния
  const EmptyState = () => (
    <div className="bg-gray-50 rounded-lg p-8 text-center">
      <div className="text-gray-500 mb-4">
        <h3 className="text-lg font-medium">Ничего не найдено</h3>
        <p className="mt-2">
          По вашему запросу не найдено ни одного развивающего занятия. 
          Попробуйте изменить параметры поиска.
        </p>
      </div>
      <button
        onClick={() => {
          router.push('/development')
          handleFilterChange({})
        }}
        className="mt-4 text-[#5CD2C6] hover:text-[#4BC0B5] underline"
      >
        Сбросить все фильтры
      </button>
    </div>
  )

  return (
    <>
      <div className="mb-8">
        <DevelopmentFilters
          initialFilters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {error && <ErrorMessage />}

      {!error && developments.length === 0 && !isInitialLoad && !isLoading && (
        <EmptyState />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {developments.map(development => (
          <DevelopmentCard key={development.id} development={development} />
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      )}

      {!isLoading && !error && hasMore && (
        <div ref={ref} className="h-4" />
      )}
    </>
  )
}

export default function DevelopmentPage() {
  const pathname = usePathname()

  return (
    <main className="min-h-screen bg-gray-200">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Развивающие занятия</h1>
            <p className="text-gray-600 mt-2">
              Найдите подходящие развивающие занятия для вашего ребенка
            </p>
          </div>
        </div>

        <DevelopmentList key={pathname} />
      </div>
    </main>
  )
} 