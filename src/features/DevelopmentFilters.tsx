'use client'

import { useState, useCallback,useEffect } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ServiceFiltersType } from '@/services/services.service'

interface DevelopmentFiltersProps {
  initialFilters: ServiceFiltersType
  onChange: (filters: ServiceFiltersType) => void
}

const SUBCATEGORIES = [
  { value: 'Шахматы', label: 'Шахматы' },
  { value: 'Логопед', label: 'Логопед' },
  { value: 'Рисование', label: 'Рисование' },
  { value: 'Программирование', label: 'Программирование' },
]
export default function DevelopmentFilters({ initialFilters, onChange }: DevelopmentFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [isExpanded, setIsExpanded] = useState(true)
  const [filters, setFilters] = useState<ServiceFiltersType>(initialFilters)

  // Синхронизируем состояние с URL при изменении searchParams
  useEffect(() => {
    const newFilters = {
      name: searchParams.get('name') || undefined,
      address: searchParams.get('address') || undefined,
      subcategory: searchParams.get('subcategory') || undefined,
      minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
      price: searchParams.get('price') ? 
        searchParams.get('price')!.split('-').map(Number) as [number, number] : 
        undefined,
      ageRange: searchParams.get('ageRange') ? 
        searchParams.get('ageRange')!.split('-').map(Number) as [number, number] : 
        undefined
    }
    setFilters(newFilters)
  }, [searchParams])

  const updateURL = useCallback((newFilters: ServiceFiltersType) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined) {
        params.delete(key)
      } else if (Array.isArray(value)) {
        params.set(key, `${value[0]}-${value[1]}`)
      } else {
        params.set(key, String(value))
      }
    })

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  const handleChange = useCallback((newFilters: Partial<ServiceFiltersType>) => {
    setFilters(prev => {
      const updatedFilters = { ...prev, ...newFilters }
      
      // Удаляем пустые значения
      Object.keys(updatedFilters).forEach(key => {
        const value = updatedFilters[key as keyof ServiceFiltersType]
        if (value === '' || value === undefined || value === null) {
          delete updatedFilters[key as keyof ServiceFiltersType]
        }
      })

      return updatedFilters
    })
  }, [])

  const handleReset = useCallback(() => {
    const emptyFilters = {}
    setFilters(emptyFilters)
    router.push(pathname, { scroll: false })
    onChange(emptyFilters)
  }, [router, pathname, onChange])

  const handleRangeChange = useCallback((
    type: 'price' | 'ageRange',
    index: 0 | 1,
    value: number
  ) => {
    setFilters(prev => {
      const currentRange = prev[type] || [0, 0]
      const newRange: [number, number] = [...currentRange] as [number, number]
      newRange[index] = value

      const updatedFilters = {
        ...prev,
        [type]: newRange[0] === 0 && newRange[1] === 0 ? undefined : newRange
      }

      return updatedFilters
    })
  }, [])

  const handleApplyFilters = useCallback(() => {
    updateURL(filters)
    onChange(filters)
  }, [filters, updateURL, onChange])

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Фильтры</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Свернуть</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Развернуть</span>
              </>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Сбросить все</span>
            </button>
          )}
        </div>
      </div>

      {/* Основные фильтры */}
      {isExpanded && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Поиск по названию */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Название</label>
              <input
                type="text"
                placeholder="Поиск по названию"
                value={filters.name || ''}
                onChange={(e) => handleChange({ name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5CD2C6] focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Адрес (новый фильтр) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Адрес</label>
              <input
                type="text"
                placeholder="Поиск по адресу"
                value={filters.address || ''}
                onChange={(e) => handleChange({ address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5CD2C6] focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Подкатегория */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Направление</label>
              <select
                value={filters.subcategory || ''}
                onChange={(e) => handleChange({ subcategory: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5CD2C6] focus:border-transparent text-gray-900"
              >
                <option value="">Все направления</option>
                {SUBCATEGORIES.map(sub => (
                  <option key={sub.value} value={sub.value}>{sub.label}</option>
                ))}
              </select>
            </div>

            {/* Возрастной диапазон */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Возраст</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="От"
                  value={filters.ageRange?.[0] || ''}
                  onChange={(e) => handleRangeChange('ageRange', 0, Number(e.target.value))}
                  className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5CD2C6] focus:border-transparent text-gray-900 placeholder-gray-500"
                  min="0"
                />
                <span className="text-gray-900">—</span>
                <input
                  type="number"
                  placeholder="До"
                  value={filters.ageRange?.[1] || ''}
                  onChange={(e) => handleRangeChange('ageRange', 1, Number(e.target.value))}
                  className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5CD2C6] focus:border-transparent text-gray-900 placeholder-gray-500"
                  min="0"
                />
                <span className="text-gray-600">лет</span>
              </div>
            </div>

            {/* Ценовой диапазон */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Цена за занятие</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="От"
                  value={filters.price?.[0] || ''}
                  onChange={(e) => handleRangeChange('price', 0, Number(e.target.value))}
                  className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5CD2C6] focus:border-transparent text-gray-900 placeholder-gray-500"
                  min="0"
                />
                <span className="text-gray-900">—</span>
                <input
                  type="number"
                  placeholder="До"
                  value={filters.price?.[1] || ''}
                  onChange={(e) => handleRangeChange('price', 1, Number(e.target.value))}
                  className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5CD2C6] focus:border-transparent text-gray-900 placeholder-gray-500"
                  min="0"
                />
                <span className="text-gray-600">₽</span>
              </div>
            </div>

            {/* Минимальный рейтинг */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Рейтинг</label>
              <select
                value={filters.minRating || ''}
                onChange={(e) => handleChange({ minRating: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5CD2C6] focus:border-transparent text-gray-900"
              >
                <option value="">Любой рейтинг</option>
                <option value="4">От 4.0</option>
                <option value="4.5">От 4.5</option>
                <option value="5">5.0</option>
              </select>
            </div>
          </div>

          {/* Кнопки управления фильтрами */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              onClick={handleApplyFilters}
              className="px-6 py-2 bg-[#5CD2C6] text-white rounded-lg hover:bg-[#4BC0B5]"
            >
              Применить
            </button>
          </div>
        </div>
      )}

      {/* Показываем активные фильтры даже когда свёрнуто */}
      {hasActiveFilters && (
        <div className={`${isExpanded ? 'mt-4 pt-4 border-t' : ''}`}>
          <div className="flex flex-wrap gap-2">
            {filters.name && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-200 rounded-full text-sm text-gray-800">
                <span>Название: {filters.name}</span>
                <button
                  onClick={() => handleChange({ name: undefined })}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {filters.address && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-200 rounded-full text-sm text-gray-800">
                <span>Адрес: {filters.address}</span>
                <button
                  onClick={() => handleChange({ address: undefined })}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}