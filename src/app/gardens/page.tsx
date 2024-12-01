'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Loader2, Search, Building2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import GardenCard from '@/components/features/GardenCard'
import { Garden, GardensService, GardensFiltersType } from '@/services/gardens.service'
import GardenFilters from '@/components/features/GardenFilters'

// Функция для преобразования строки в массив чисел [min, max]
const parsePriceRange = (range: string | null): [number, number] | null => {
  if (!range) return null
  const [min, max] = range.split('-').map(Number)
  return [min, max]
}

const GardensList = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const initialFetchRef = useRef(false)

  // Получаем фильтры из URL
  const filters: GardensFiltersType = {
    type: (searchParams.get('type') as GardensFiltersType['type']) || 'all',
    name: searchParams.get('name') || undefined,
    minRating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
    priceRange: parsePriceRange(searchParams.get('price')),
    city: searchParams.get('city') || undefined
  }

  // Загрузка данных
  const loadGardens = useCallback(async (pageNum: number) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await GardensService.getGardens(pageNum, 12, filters)
      
      // Проверка корректности данных
      if (!response || !Array.isArray(response.data)) {
        throw new Error('Некорректный формат данных')
      }

      if (pageNum === 1) {
        setGardens(response.data)
      } else {
        setGardens(prev => [...prev, ...response.data])
      }
      
      setHasMore(pageNum < response.totalPages)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Произошла ошибка при загрузке данных'
      setError(errorMessage)
      setHasMore(false)
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
      loadGardens(1)
    }
  }, [loadGardens])

  // Intersection Observer для бесконечной прокрутки
  const { ref, inView } = useInView({
    threshold: 0
  })

  useEffect(() => {
    if (inView && !isLoading && hasMore && !isInitialLoad) {
      setPage(prev => prev + 1)
      loadGardens(page + 1)
    }
  }, [inView, isLoading, hasMore, loadGardens, page, isInitialLoad])

  // Обработчик изменения фильтров
  const handleFilterChange = (newFilters: GardensFiltersType) => {
    const params = new URLSearchParams()
    
    if (newFilters.type && newFilters.type !== 'all') params.set('type', newFilters.type)
    if (newFilters.name) params.set('name', newFilters.name)
    if (newFilters.minRating) params.set('rating', String(newFilters.minRating))
    if (newFilters.priceRange) params.set('price', `${newFilters.priceRange[0]}-${newFilters.priceRange[1]}`)
    if (newFilters.city) params.set('city', newFilters.city)

    router.push(`/gardens${params.toString() ? '?' + params.toString() : ''}`)
  }

  // Компонент для отображения ошибки
  const ErrorMessage = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 text-red-700">
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">{error}</span>
      </div>
      <button 
        onClick={() => {
          setError(null)
          loadGardens(1)
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
        <Building2 className="w-12 h-12 mx-auto mb-4" />
        <h3 className="text-lg font-medium">Ничего не найдено</h3>
        <p className="mt-2">
          По вашему запросу не найдено ни одного детского сада. 
          Попробуйте изменить параметры поиска.
        </p>
      </div>
      <button
        onClick={() => {
          router.push('/gardens')
          setFilters({})
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
        <GardenFilters
          initialFilters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {error && <ErrorMessage />}

      {!error && gardens.length === 0 && !isInitialLoad && !isLoading && (
        <EmptyState />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gardens.map(garden => (
          <GardenCard key={garden.id} garden={garden} />
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

export default function GardensPage() {
  const pathname = usePathname()

  return (
    <main className="min-h-screen bg-gray-200">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Детские сады</h1>
            <p className="text-gray-600 mt-2">
              Найдите лучший детский сад для вашего ребенка
            </p>
          </div>
        </div>

        <GardensList key={pathname} />
      </div>
    </main>
  )
} 