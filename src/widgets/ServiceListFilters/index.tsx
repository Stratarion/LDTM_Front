'use client'

// libs
import { useCallback, useState } from "react"
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { X } from "lucide-react"

// models
import { IServiceListFilters } from "./models/IServiceListFilters"
import { IServiceFilters } from "@/entities/service/model/IServiceFilters"

// components
import { TopButtons } from "./components/TopButtons"
import { FilterComponent } from "./components/FilterComponent"
import { IServiceListFilter } from "./models/IServiceListFilter"

export const ServiceListFilters = ({
  initialFilters,
  onFilterChange,
  filtersList,
}: IServiceListFilters) => {
  const router = useRouter()
  const pathname = usePathname()

  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<IServiceFilters>(initialFilters)
  const [isExpanded, setIsExpanded] = useState(true)

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined)

    const updateURL = useCallback((newFilters: IServiceFilters) => {
    if (!searchParams) return;
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

  const handleChange = useCallback(<K extends keyof IServiceFilters>({obj, newValue}: {obj: K, newValue: IServiceFilters[K]}) => {
    setFilters(prev => {
      const updatedFilters = prev
      if (!prev[obj]) return prev;
      prev[obj] = newValue;
      // Удаляем пустые значения
      Object.keys(updatedFilters).forEach(key => {
        const value = updatedFilters[key as keyof IServiceFilters]
        if (value === '' || value === undefined || value === null) {
          delete updatedFilters[key as keyof IServiceFilters]
        }
      })

      return updatedFilters
    })
  }, [])

  const handleReset = useCallback(() => {
    const emptyFilters = {}
    setFilters(emptyFilters)
    if (!pathname) return;
    router.push(pathname, { scroll: false })
    onFilterChange(emptyFilters)
  }, [router, pathname, onFilterChange])

  const handleApplyFilters = useCallback(() => {
    updateURL(filters)
    onFilterChange(filters)
  }, [filters, updateURL, onFilterChange])

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Фильтры</h2>
        <TopButtons
          isExpanded={isExpanded}
          hasActiveFilters={hasActiveFilters}
          handleReset={handleReset}
          handleExpandClick={setIsExpanded}
        />
      </div>

      {isExpanded && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {filtersList.map(filter => (
              <FilterComponent
                key={filter.obj}
                filter={filter as IServiceListFilter<keyof IServiceFilters>}
                handleChange={handleChange}
                value={filters[filter.obj]}
              />
            ))}
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              onClick={handleApplyFilters}
              className="px-6 py-2 bg-[#5CD2C6] text-white rounded-lg hover:bg-[#4BC0B5]"
            >
              Применить
            </button>
          </div>
        </>
      )}
    {hasActiveFilters && (
      <div className={`${isExpanded ? 'mt-4 pt-4 border-t' : ''}`}>
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;

            // Обработка диапазонов (priceRange, ageRange)
            if (typeof value === 'object' && (key === 'priceRange' || key === 'ageRange')) {
              const range = value as { min?: number; max?: number };
              if (!range.min && !range.max) return null;
              
              const label = key === 'priceRange' ? 'Цена' : 'Возраст';
              const displayValue = `${range.min ?? ''}${range.min && range.max ? '-' : ''}${range.max ?? ''}`;
              
              return (
                <div key={key} className="flex items-center gap-1 px-2 py-1 bg-gray-200 rounded-full text-sm text-gray-800">
                  <span>{label}: {displayValue}</span>
                  <button
                    onClick={() => handleChange({ obj: key as keyof IServiceFilters, newValue: undefined })}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            }

            // Обработка обычных значений
            const filterConfig = filtersList.find(f => f.obj === key);
            if (!filterConfig) return null;

            // Для select находим соответствующую опцию
            let displayValue = String(value);
            if (filterConfig.type === 'select' && filterConfig.options) {
              const option = filterConfig.options.find(opt => opt.value === value);
              if (option) displayValue = option.label;
            }

            return (
              <div key={key} className="flex items-center gap-1 px-2 py-1 bg-gray-200 rounded-full text-sm text-gray-800">
                <span>{filterConfig.label}: {displayValue}</span>
                <button
                  onClick={() => handleChange({ obj: key as keyof IServiceFilters, newValue: undefined })}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    )}
    </div>
  )
}