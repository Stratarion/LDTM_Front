'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Loader2, Search } from 'lucide-react'
import Header from '@/components/layout/Header'
import SchoolCard from '@/components/features/SchoolCard'
import { School, SchoolsService, SchoolFiltersType } from '@/services/schools.service'
import SchoolFilters from '@/components/features/SchoolFilters'

// Функция для преобразования строки в массив чисел [min, max]
const parsePriceRange = (range: string | null): [number, number] | null => {
  if (!range) return null
  const [min, max] = range.split('-').map(Number)
  return [min, max]
}

const SchoolsList = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [schools, setSchools] = useState<School[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const initialFetchRef = useRef(false)

  // Функция для преобразования параметров URL в фильтры
  const getFiltersFromUrl = useCallback(() => {
    const filters: SchoolFiltersType = {
      type: (searchParams.get('type') as SchoolFiltersType['type']) || 'all',
      priceRange: parsePriceRange(searchParams.get('priceRange')),
      name: searchParams.get('name') || '',
      minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : null,
      city: searchParams.get('city') || null
    }
    return filters
  }, [searchParams])

  const [activeFilters, setActiveFilters] = useState<SchoolFiltersType>(getFiltersFromUrl())

  // Функция для обновления URL с фильтрами
  const updateUrlWithFilters = useCallback((filters: SchoolFiltersType) => {
    const params = new URLSearchParams()

    if (filters.type !== 'all') params.set('type', filters.type)
    if (filters.priceRange) params.set('priceRange', `${filters.priceRange[0]}-${filters.priceRange[1]}`)
    if (filters.name) params.set('name', filters.name)
    if (filters.minRating) params.set('minRating', filters.minRating.toString())
    if (filters.city) params.set('city', filters.city)

    const newUrl = `/schools${params.toString() ? '?' + params.toString() : ''}`
    router.push(newUrl, { scroll: false })
  }, [router])

  const handleFiltersChange = useCallback((filters: SchoolFiltersType) => {
    setActiveFilters(filters)
    setPage(1)
    setSchools([])
    setHasMore(true)
    setIsInitialLoad(true)
    initialFetchRef.current = false
    
    // Формируем строку запроса
    const params = new URLSearchParams()
    if (filters.type !== 'all') params.set('type', filters.type)
    if (filters.priceRange) params.set('priceRange', `${filters.priceRange[0]}-${filters.priceRange[1]}`)
    if (filters.name) params.set('name', filters.name)
    if (filters.minRating) params.set('minRating', filters.minRating.toString())
    if (filters.city) params.set('city', filters.city)

    const queryString = params.toString() ? `?${params.toString()}` : ''
    
    // Сохраняем фильтры в localStorage
    localStorage.setItem('schoolFilters', queryString)
    
    updateUrlWithFilters(filters)
  }, [updateUrlWithFilters])

  const { ref, inView } = useInView({
    threshold: 0.1,
    initialInView: false
  })

  const loadMoreSchools = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const response = await SchoolsService.getSchools(page, 10, activeFilters)
      setSchools(prev => [...prev, ...response.data])
      setHasMore(page < response.numberOfPages)
      setPage(prev => prev + 1)
    } catch (error) {
      console.error('Failed to load schools:', error)
    } finally {
      setIsLoading(false)
      setIsInitialLoad(false)
    }
  }, [page, isLoading, hasMore, activeFilters])

  useEffect(() => {
    if (!initialFetchRef.current) {
      initialFetchRef.current = true
      loadMoreSchools()
    } else if (inView && !isInitialLoad && !isLoading && hasMore) {
      loadMoreSchools()
    }
  }, [inView, isInitialLoad, isLoading, hasMore, loadMoreSchools])

  const renderContent = () => {
    if (isInitialLoad && isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      )
    }

    if (!isLoading && schools.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Search className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Похоже, по этому запросу ничего нет
          </h3>
          <p className="text-gray-500 text-center">
            Попробуйте изменить параметры поиска или вернитесь позже
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {schools.map((school, index) => (
          <SchoolCard 
            key={`${school.id}-${index}`} 
            school={school} 
          />
        ))}
        
        {/* Loader */}
        <div ref={ref} className="flex justify-center py-8">
          {isLoading && (
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          )}
        </div>

        {/* No more schools message */}
        {!hasMore && schools.length > 0 && (
          <p className="text-center text-gray-500 py-8">
            Больше школ не найдено
          </p>
        )}
      </div>
    )
  }

  return (
    <>
      <SchoolFilters 
        onFiltersChange={handleFiltersChange} 
        initialFilters={getFiltersFromUrl()} 
      />
      {renderContent()}
    </>
  )
}

// Основной компонент страницы
export default function SchoolsPage() {
  const pathname = usePathname()

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Школы</h1>
            <p className="text-gray-600 mt-2">
              Найдите лучшую школу для вашего ребенка
            </p>
          </div>
        </div>

        {/* Используем ключ для сброса состояния при навигации */}
        <SchoolsList key={pathname} />
      </div>
    </main>
  )
} 