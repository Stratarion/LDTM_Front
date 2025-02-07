'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import SportCard from '@/components/features/SportCard'
import { Service } from '@/services/services.service'
import { SportsService, SportFiltersType } from '@/services/sports.service'
import SportFilters from '@/components/features/SportFilters'

// Функция для преобразования строки в массив чисел [min, max]
const parsePriceRange = (range: string | null): [number, number] | null => {
  if (!range) return null
  const [min, max] = range.split('-').map(Number)
  return [min, max]
}

const parseAgeRange = (range: string | null): [number, number] | null => {
  if (!range) return null
  const [min, max] = range.split('-').map(Number)
  return [min, max]
}

const SportsList = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sports, setSports] = useState<Service[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const initialFetchRef = useRef(false)

  // Получаем фильтры из URL
  const filters: SportFiltersType = {
    type: (searchParams.get('type') as SportFiltersType['type']) || 'all',
    name: searchParams.get('name') || undefined,
    minRating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
    priceRange: parsePriceRange(searchParams.get('price')),
    city: searchParams.get('city') || undefined,
    ageRange: parseAgeRange(searchParams.get('age'))
  }

  // Загрузка данных
  const loadSports = useCallback(async (pageNum: number) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await SportsService.getSports(
        pageNum,
        12,
        filters
      )
      
      if (pageNum === 1) {
        setSports(response.data)
      } else {
        setSports(prev => [...prev, ...response.data])
      }
      
      setHasMore(pageNum < response.totalPages)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Произошла ошибка при загрузке данных'
      setError(errorMessage)
      setHasMore(false)
      console.error('Failed to load sports:', err)
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
      loadSports(1)
    }
  }, [loadSports])

  // Intersection Observer для бесконечной прокрутки
  const { ref, inView } = useInView({
    threshold: 0
  })

  useEffect(() => {
    if (inView && !isLoading && hasMore && !isInitialLoad) {
      setPage(prev => prev + 1)
      loadSports(page + 1)
    }
  }, [inView, isLoading, hasMore, loadSports, page, isInitialLoad])

  // Обработчик изменения фильтров
  const handleFilterChange = (newFilters: SportFiltersType) => {
    const params = new URLSearchParams()
    
    if (newFilters.type && newFilters.type !== 'all') params.set('type', newFilters.type)
    if (newFilters.name) params.set('name', newFilters.name)
    if (newFilters.minRating) params.set('rating', String(newFilters.minRating))
    if (newFilters.priceRange) params.set('price', `${newFilters.priceRange[0]}-${newFilters.priceRange[1]}`)
    if (newFilters.city) params.set('city', newFilters.city)
    if (newFilters.ageRange) params.set('age', `${newFilters.ageRange[0]}-${newFilters.ageRange[1]}`)

    router.push(`/sports${params.toString() ? '?' + params.toString() : ''}`)
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
          loadSports(1)
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
          По вашему запросу не найдено ни одной спортивной секции. 
          Попробуйте изменить параметры поиска.
        </p>
      </div>
      <button
        onClick={() => {
          router.push('/sports')
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
        <SportFilters
          initialFilters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {error && <ErrorMessage />}

      {!error && sports.length === 0 && !isInitialLoad && !isLoading && (
        <EmptyState />
      )}

      <div className="space-y-4">
        {sports.map(sport => (
          <SportCard key={sport.id} sport={sport} />
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

export default function SportsPage() {
  const pathname = usePathname()

  return (
    <main className="min-h-screen bg-gray-200">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Спортивные секции</h1>
            <p className="text-gray-600 mt-2">
              Найдите подходящую спортивную секцию для вашего ребенка
            </p>
          </div>
        </div>

        <SportsList key={pathname} />
      </div>
    </main>
  )
}
