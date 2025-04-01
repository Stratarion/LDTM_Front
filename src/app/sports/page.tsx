'use client'

import { useEffect, useState, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import SportCard from '@/components/features/SportCard'
import { Sport, SportsService, SportFiltersType } from '@/services/sports.service'
import SportFilters from '@/components/features/SportFilters'
import SportMap from '@/components/features/sport/SportMap'

const SportsList = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [sports, setSports] = useState<Sport[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentFilters, setCurrentFilters] = useState<SportFiltersType>({})
  const [isMapFullscreen, setIsMapFullscreen] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  // Get user location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude]
          setUserLocation(coords)
          // Больше не обновляем фильтры с координатами пользователя
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }, [])

  // Загрузка данных с фильтрами
  const loadSports = useCallback(async (pageNum: number, filters: SportFiltersType) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await SportsService.getSports(pageNum, 12, filters, userLocation || undefined)
      if (pageNum === 1) {
        setSports(response.data)
      } else {
        setSports(prev => [...prev, ...response.data])
      }
      
      setHasMore(pageNum < response.totalPages)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Произошла ошибка при загрузке данных')
      setHasMore(false)
    } finally {
      setIsLoading(false)
      setIsInitialLoad(false)
    }
  }, [userLocation])

  // Обработчик изменения фильтров (с обновлением URL)
  const handleFilterChange = useCallback(async (newFilters: SportFiltersType) => {
    const params = new URLSearchParams()
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          params.set(key, JSON.stringify(value))
        } else {
          params.set(key, String(value))
        }
      }
    })

    await router.push(`${pathname}${params.toString() ? '?' + params.toString() : ''}`)
    setCurrentFilters(newFilters)
    setPage(1)
    setSports([])
    loadSports(1, newFilters)
  }, [router, pathname, loadSports])

  // Загрузка следующей страницы
  const { ref, inView } = useInView({
    threshold: 0,
  })

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      const nextPage = page + 1
      setPage(nextPage)
      loadSports(nextPage, currentFilters)
    }
  }, [inView, hasMore, isLoading, page, loadSports, currentFilters])

  // Начальная загрузка только при изменении фильтров
  useEffect(() => {
    loadSports(1, currentFilters)
  }, [loadSports, currentFilters])

  const ErrorMessage = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 text-red-700">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
      <button 
        onClick={() => {
          setError(null)
          loadSports(1, currentFilters)
        }}
        className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
      >
        Попробовать снова
      </button>
    </div>
  )

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
          initialFilters={currentFilters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {error && <ErrorMessage />}

      {!error && sports.length === 0 && !isInitialLoad && !isLoading && (
        <EmptyState />
      )}

      <SportMap 
        sports={sports} 
        isFullscreen={isMapFullscreen}
        onFullscreenChange={setIsMapFullscreen}
      />

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
