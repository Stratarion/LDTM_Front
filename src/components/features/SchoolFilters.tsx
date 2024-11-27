'use client'

import { useState, useCallback, useEffect } from 'react'
import { ChevronDown, ChevronUp, X, Filter } from 'lucide-react'
import { SchoolFiltersType } from '@/services/schools.service'
import Autocomplete from '@/components/shared/Autocomplete'
import { debounce } from '@/utils/debounce'
import RangeSlider from '@/components/shared/RangeSlider'

// Общие стили для всех элементов управления
const inputStyles = "w-full h-11 rounded-lg border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
const labelStyles = "block text-sm font-medium text-gray-900 mb-2"

// Список городов (можно вынести в отдельный файл или получать с сервера)
const cities = [
  'Москва',
  'Санкт-Петербург',
  'Казань',
  'Новосибирск',
  'Екатеринбург',
  'Нижний Новгород',
  'Самара',
  'Омск',
  'Челябинск',
	'Курск',
	'Курчатов',
  'Ростов-на-Дону'
].sort()

interface SchoolFiltersProps {
  onFiltersChange: (filters: SchoolFiltersType) => void;
  initialFilters: SchoolFiltersType;
}

// Добавим форматирование цены
const formatPrice = (price: number) => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M ₽`
  }
  if (price >= 1000) {
    return `${(price / 1000).toFixed(0)}K ₽`
  }
  return `${price} ₽`
}

export default function SchoolFilters({ onFiltersChange, initialFilters }: SchoolFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [filters, setFilters] = useState<SchoolFiltersType>(initialFilters)

  // Обновляем фильтры при изменении initialFilters
  useEffect(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  // Создаем дебаунсированную версию onFiltersChange
  const debouncedFiltersChange = useCallback(
    debounce((newFilters: SchoolFiltersType) => {
      onFiltersChange(newFilters)
    }, 1000),
    [onFiltersChange]
  )

  const handleFilterChange = (key: keyof SchoolFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value }

    // Если тип школы меняется на государственную, сбрасываем фильтр стоимости
    if (key === 'type' && value === 'state') {
      newFilters.priceRange = null
    }

    setFilters(newFilters)
    
    // Используем дебаунс только для поиска по названию и городу
    if (key === 'name' || key === 'city') {
      debouncedFiltersChange(newFilters)
    } else {
      // Для остальных фильтров применяем изменения сразу
      onFiltersChange(newFilters)
    }
  }

  const clearFilters = () => {
    const defaultFilters: SchoolFiltersType = {
      type: 'all',
      priceRange: null,
      name: '',
      minRating: null,
      city: '', // Сброс города
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm mb-6">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-900" />
          {Object.values(filters).some(value => 
            value !== null && value !== 'all' && value !== ''
          ) && (
            <span className="px-2 py-1 bg-[#5CD2C6] text-white text-sm rounded-full">
              Активны
            </span>
          )}
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Город */}
            <div className="flex flex-col">
              <Autocomplete
                label="Город"
                value={filters.city || ''}
                onChange={(value) => handleFilterChange('city', value)}
                options={cities}
                placeholder="Выберите город"
              />
            </div>

            {/* Тип школы */}
            <div className="flex flex-col">
              <label className={labelStyles}>
                Тип школы
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value as SchoolFiltersType['type'])}
                className={inputStyles}
              >
                <option value="all">Все типы</option>
                <option value="state">Государственные</option>
                <option value="private">Частные</option>
              </select>
            </div>

            {/* Поиск по названию */}
            <div className="flex flex-col">
              <label className={labelStyles}>
                Название
              </label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                placeholder="Поиск по названию"
                className={`${inputStyles} placeholder:text-gray-500`}
              />
            </div>

            {/* Минимальный рейтинг */}
            <div className="flex flex-col">
              <label className={labelStyles}>
                Минимальный рейтинг
              </label>
              <select
                value={filters.minRating || ''}
                onChange={(e) => handleFilterChange('minRating', e.target.value ? Number(e.target.value) : null)}
                className={inputStyles}
              >
                <option value="">Любой</option>
                <option value="4.5">4.5 и выше</option>
                <option value="4">4.0 и выше</option>
                <option value="3.5">3.5 и выше</option>
                <option value="3">3.0 и выше</option>
              </select>
            </div>

            {/* Пустой элемент для выравнивания сетки */}
            <div className="flex flex-col lg:hidden"></div>

            {/* Стоимость - показываем только для частных школ или когда выбраны все типы */}
            {filters.type !== 'state' && (
              <div className="flex flex-col col-span-2 lg:col-span-5">
                <label className={labelStyles}>
                  Стоимость в месяц
                </label>
                <RangeSlider
                  min={0}
                  max={100000}
                  step={1000}
                  value={filters.priceRange || [0, 100000]}
                  onChange={(value) => handleFilterChange('priceRange', value)}
                  formatValue={formatPrice}
                />
              </div>
            )}
          </div>

          {/* Кнопка сброса */}
          {Object.values(filters).some(value => 
            value !== null && value !== 'all' && value !== ''
          ) && (
            <button
              onClick={clearFilters}
              className="mt-6 flex items-center gap-2 text-sm text-gray-900 hover:text-black"
            >
              <X size={16} />
              Сбросить все фильтры
            </button>
          )}
        </div>
      )}
    </div>
  )
} 