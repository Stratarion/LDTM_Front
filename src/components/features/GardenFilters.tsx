'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { GardensFiltersType } from '@/services/gardens.service'

interface GardenFiltersProps {
  initialFilters: GardensFiltersType
  onFilterChange: (filters: GardensFiltersType) => void
}

export default function GardenFilters({ initialFilters, onFilterChange }: GardenFiltersProps) {
  const [filters, setFilters] = useState<GardensFiltersType>(initialFilters)
  const [priceMin, setPriceMin] = useState(filters.priceRange?.[0]?.toString() || '')
  const [priceMax, setPriceMax] = useState(filters.priceRange?.[1]?.toString() || '')

  useEffect(() => {
    setFilters(initialFilters)
    setPriceMin(initialFilters.priceRange?.[0]?.toString() || '')
    setPriceMax(initialFilters.priceRange?.[1]?.toString() || '')
  }, [initialFilters])

  const handleFilterChange = (key: keyof GardensFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handlePriceChange = () => {
    const min = Number(priceMin)
    const max = Number(priceMax)
    
    if (min && max && min <= max) {
      handleFilterChange('priceRange', [min, max])
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
      {/* Поиск по названию */}
      <div>
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск по названию"
            value={filters.name || ''}
            onChange={(e) => handleFilterChange('name', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900 placeholder-gray-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Тип сада */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Тип сада
          </label>
          <select
            value={filters.type || 'all'}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
          >
            <option value="all">Все</option>
            <option value="state">Государственные</option>
            <option value="private">Частные</option>
          </select>
        </div>

        {/* Минимальный рейтинг */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Минимальный рейтинг
          </label>
          <select
            value={filters.minRating || ''}
            onChange={(e) => handleFilterChange('minRating', Number(e.target.value) || undefined)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
          >
            <option value="">Любой</option>
            <option value="4">От 4 и выше</option>
            <option value="4.5">От 4.5 и выше</option>
            <option value="4.8">От 4.8 и выше</option>
          </select>
        </div>

        {/* Город */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Город
          </label>
          <select
            value={filters.city || ''}
            onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
          >
            <option value="">Все города</option>
            <option value="moscow">Москва</option>
            <option value="spb">Санкт-Петербург</option>
          </select>
        </div>
      </div>

      {/* Диапазон цен */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Стоимость в месяц (₽)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="number"
            placeholder="От"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            onBlur={handlePriceChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900 placeholder-gray-500"
          />
          <span className="text-gray-600">—</span>
          <input
            type="number"
            placeholder="До"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            onBlur={handlePriceChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900 placeholder-gray-500"
          />
        </div>
      </div>
    </div>
  )
} 