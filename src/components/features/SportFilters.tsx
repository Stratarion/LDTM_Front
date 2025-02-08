'use client'

import { useState } from 'react'
import { SportFiltersType } from '@/services/sports.service'

interface SportFiltersProps {
  initialFilters: SportFiltersType
  onFilterChange: (filters: SportFiltersType) => void
}

const CATEGORIES = [
  { value: 'sport', label: 'Спорт' },
  { value: 'dance', label: 'Танцы' },
  { value: 'art', label: 'Искусство' }
]

const SUBCATEGORIES = [
  { value: 'Борьба', label: 'Борьба' },
  { value: 'Футбол', label: 'Футбол' },
  { value: 'Плавание', label: 'Плавание' }
]

export default function SportFilters({ initialFilters, onFilterChange }: SportFiltersProps) {
  const [filters, setFilters] = useState<SportFiltersType>(initialFilters)

  const handleChange = (newFilters: Partial<SportFiltersType>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Категория */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">Категория</label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleChange({ category: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5CD2C6] focus:border-transparent text-gray-900"
          >
            <option value="">Все категории</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
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
              onChange={(e) => handleChange({ 
                ageRange: [Number(e.target.value), filters.ageRange?.[1] || 18] 
              })}
              className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5CD2C6] focus:border-transparent text-gray-900 placeholder-gray-500"
              min="0"
            />
            <span className="text-gray-900">—</span>
            <input
              type="number"
              placeholder="До"
              value={filters.ageRange?.[1] || ''}
              onChange={(e) => handleChange({ 
                ageRange: [filters.ageRange?.[0] || 0, Number(e.target.value)] 
              })}
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
              onChange={(e) => handleChange({ 
                price: [Number(e.target.value), filters.price?.[1] || 10000] 
              })}
              className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5CD2C6] focus:border-transparent text-gray-900 placeholder-gray-500"
              min="0"
            />
            <span className="text-gray-900">—</span>
            <input
              type="number"
              placeholder="До"
              value={filters.price?.[1] || ''}
              onChange={(e) => handleChange({ 
                price: [filters.price?.[0] || 0, Number(e.target.value)] 
              })}
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
    </div>
  )
} 