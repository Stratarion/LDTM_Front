'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useInView } from 'react-intersection-observer'
import { Loader2, AlertCircle } from 'lucide-react'
import Header from '@/widgets/Header'
import DevelopmentCard from '@/features/DevelopmentCard'
import DevelopmentFilters from '@/features/DevelopmentFilters'
import { IService, DevelopmentType } from '@/shared/types/service'
import { ServiceFiltersType } from '@/services/services.service'
import { DevelopmentService, Development } from '@/services/development.service'

// Функция для преобразования Development в Service
const mapDevelopmentToService = (development: Development): IService => ({
  ...development,
  category: 'development' as const,
  org_id: '', // Добавляем обязательные поля с пустыми значениями
  createdAt: '',
  updatedAt: '',
  avgRating: development.rating,
  location: development.address,
  photos: [],
  reviews: [],
  teacher_id: null,
  development_type: development.subcategory as DevelopmentType,
  skill_level: 'beginner',
  learning_format: 'group',
  address: {
    full: development.address,
    coordinates: [0, 0] // Временные координаты, так как они не приходят с бэкенда
  }
})

export default function DevelopmentPage() {
  
  const router = useRouter()
  const pathname = usePathname()
  const [services, setServices] = useState<IService[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentFilters, setCurrentFilters] = useState<ServiceFiltersType>({})

  // Загрузка данных с фильтрами
  const loadDevelopments = useCallback(async (pageNum: number, filters: ServiceFiltersType) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await DevelopmentService.getDevelopments(pageNum, 12, filters)
      if (pageNum === 1) {
        setServices(response.data.map(mapDevelopmentToService))
      } else {
        setServices(prev => [...prev, ...response.data.map(mapDevelopmentToService)])
      }
      
      setHasMore(pageNum < response.totalPages)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Произошла ошибка при загрузке данных')
      setHasMore(false)
    } finally {
      setIsLoading(false)
      setIsInitialLoad(false)
    }
  }, [])

  const handleFilterChange = useCallback(async (newFilters: ServiceFiltersType) => {
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

    // Обновляем URL и состояние фильтров
    await router.push(`${pathname}${params.toString() ? '?' + params.toString() : ''}`)
    setCurrentFilters(newFilters)

    // Сбрасываем страницу и загружаем данные с новыми фильтрами
    setCurrentPage(1)
    setServices([])
    loadDevelopments(1, newFilters)
  }, [router, pathname, loadDevelopments])

  // Загрузка следующей страницы
  const loadNextPage = useCallback(() => {
    if (!isLoading && hasMore && !isInitialLoad) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      loadDevelopments(nextPage, currentFilters)
    }
  }, [isLoading, hasMore, isInitialLoad, currentPage, currentFilters, loadDevelopments])

  // Первичная загрузка
  useEffect(() => {
    if (isInitialLoad) {
      loadDevelopments(1, currentFilters)
    }
  }, [isInitialLoad, currentFilters, loadDevelopments])

  // Intersection Observer для бесконечной прокрутки
  const { ref, inView } = useInView({
    threshold: 0
  })

  useEffect(() => {
    if (inView) {
      loadNextPage()
    }
  }, [inView, loadNextPage])

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
          loadDevelopments(1, currentFilters)
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
    <div className="min-h-screen bg-gray-200">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Развивающие занятия</h1>
            <p className="text-gray-600 mt-2">
              Найдите подходящее развивающее занятие для вашего ребенка
            </p>
          </div>
        </div>

        <div className="mb-8">
          <DevelopmentFilters
            initialFilters={currentFilters}
            onChange={handleFilterChange}
          />
        </div>

        {error && <ErrorMessage />}

        {!error && services.length === 0 && !isLoading && (
          <EmptyState />
        )}

        <div className="space-y-4">
          {services.map(service => (
            <DevelopmentCard key={service.id} service={service} />
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
      </div>
    </div>
  )
} 