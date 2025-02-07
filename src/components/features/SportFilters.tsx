'use client'

import { useState, useEffect } from 'react'
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react'
import { ServiceFiltersType } from '@/services/services.service'
import { SportFiltersType } from '@/services/sports.service'

interface SportFiltersProps {
  initialFilters: SportFiltersType
  onFilterChange: (filters: SportFiltersType) => void
}

const SPORT_TYPES = [
  { value: 'football', label: 'Футбол' },
  { value: 'basketball', label: 'Баскетбол' },
  { value: 'volleyball', label: 'Волейбол' },
  { value: 'tennis', label: 'Теннис' },
  { value: 'swimming', label: 'Плавание' },
  { value: 'martial_arts', label: 'Единоборства' },
  { value: 'gymnastics', label: 'Гимнастика' },
  { value: 'dance', label: 'Танцы' },
  { value: 'other', label: 'Другое' }
]

export default function SportFilters({ initialFilters, onFilterChange }: SportFiltersProps) {
  const [filters, setFilters] = useState<SportFiltersType>(initialFilters)
  const [priceMin, setPriceMin] = useState(filters.priceRange?.[0]?.toString() || '')
  const [priceMax, setPriceMax] = useState(filters.priceRange?.[1]?.toString() || '')
  const [ageMin, setAgeMin] = useState(filters.ageRange?.[0]?.toString() || '')
  const [ageMax, setAgeMax] = useState(filters.ageRange?.[1]?.toString() || '')
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    setFilters(initialFilters)
    setPriceMin(initialFilters.priceRange?.[0]?.toString() || '')
    setPriceMax(initialFilters.priceRange?.[1]?.toString() || '')
    setAgeMin(initialFilters.ageRange?.[0]?.toString() || '')
    setAgeMax(initialFilters.ageRange?.[1]?.toString() || '')
  }, [initialFilters])

  const handleFilterChange = (key: keyof SportFiltersType, value: any) => {
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

  const handleAgeChange = () => {
    const min = Number(ageMin)
    const max = Number(ageMax)
    
    if (min && max && min <= max) {
      handleFilterChange('ageRange', [min, max])
    }
  }

  const resetFilters = () => {
    const emptyFilters: SportFiltersType = {
      type: 'all',
      sportType: undefined,
      name: undefined,
      minRating: undefined,
      priceRange: undefined,
      city: undefined,
      ageRange: undefined,
      maxStudents: undefined
    }
    setFilters(emptyFilters)
    setPriceMin('')
    setPriceMax('')
    setAgeMin('')
    setAgeMax('')
    onFilterChange(emptyFilters)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm">
      {/* Заголовок с кнопками */}
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="font-medium text-gray-900">Фильтры</h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        <button
          onClick={resetFilters}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Сбросить
        </button>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Поиск по названию */}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Тип организации */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Тип организации
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

            {/* Тип секции */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Вид спорта
              </label>
              <select
                value={filters.sportType || ''}
                onChange={(e) => handleFilterChange('sportType', e.target.value || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
              >
                <option value="">Все виды</option>
                {SPORT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Диапазон цен */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Стоимость за занятие (₽)
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

            {/* Возрастной диапазон */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Возраст ребенка (лет)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  placeholder="От"
                  value={ageMin}
                  onChange={(e) => setAgeMin(e.target.value)}
                  onBlur={handleAgeChange}
                  min="0"
                  max="18"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900 placeholder-gray-500"
                />
                <span className="text-gray-600">—</span>
                <input
                  type="number"
                  placeholder="До"
                  value={ageMax}
                  onChange={(e) => setAgeMax(e.target.value)}
                  onBlur={handleAgeChange}
                  min="0"
                  max="18"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Количество детей и рейтинг */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Максимальное количество детей в группе
              </label>
              <select
                value={filters.maxStudents || ''}
                onChange={(e) => handleFilterChange('maxStudents', Number(e.target.value) || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
              >
                <option value="">Любое количество</option>
                <option value="5">До 5 детей</option>
                <option value="10">До 10 детей</option>
                <option value="15">До 15 детей</option>
                <option value="20">До 20 детей</option>
              </select>
            </div>

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
          </div>
        </div>
      )}
    </div>
  )
} 