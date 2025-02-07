import React from 'react'
import { ServiceCategory } from '../../services/services.service'

const SERVICE_CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: 'sport', label: 'Спорт' },
  { value: 'art', label: 'Искусство' },
  { value: 'education', label: 'Образование' },
  { value: 'other', label: 'Другое' }
]

export default function ServiceFilters({ initialFilters, onFilterChange }: ServiceFiltersProps) {
  // ... остальной код без изменений

  return (
    <div className="bg-white rounded-2xl shadow-sm">
      {/* ... остальной JSX */}
      
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Категория
        </label>
        <select
          value={filters.category || ''}
          onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CD2C6]"
        >
          <option value="">Все категории</option>
          {SERVICE_CATEGORIES.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* ... остальные фильтры */}
    </div>
  )
} 