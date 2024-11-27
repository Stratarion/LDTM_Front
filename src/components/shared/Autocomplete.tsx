'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { debounce } from '@/utils/debounce'

interface AutocompleteProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  className?: string
  label?: string
}

export default function Autocomplete({
  value,
  onChange,
  options,
  placeholder = '',
  className = '',
  label
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState(value)
  const [filteredOptions, setFilteredOptions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSearch(value)
  }, [value])

  const debouncedFilter = useCallback(
    debounce((searchValue: string) => {
      const filtered = options.filter(option =>
        option.toLowerCase().includes(searchValue.toLowerCase())
      )
      setFilteredOptions(filtered)
    }, 1000),
    [options]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearch(newValue)
    setIsOpen(true)
    debouncedFilter(newValue)
  }

  useEffect(() => {
    setFilteredOptions(options)
  }, [options])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOptionClick = (option: string) => {
    onChange(option)
    setSearch(option)
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange('')
    setSearch('')
    setFilteredOptions(options)
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full h-11 rounded-lg border border-gray-300 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-black placeholder:text-gray-500 ${className}`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={14} className="text-gray-500" />
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            {isOpen ? (
              <ChevronUp size={18} className="text-gray-500" />
            ) : (
              <ChevronDown size={18} className="text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {filteredOptions.map((option) => (
            <button
              key={option}
              onClick={() => handleOptionClick(option)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-black ${
                option === value ? 'bg-gray-50' : ''
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 