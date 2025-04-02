'use client'

import { useEffect, useState, useRef } from 'react'
import { Input } from '@/shared/ui/input'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface AddressAutocompleteProps {
  value: string
  onChange: (address: {
    fullAddress: string
    country: string
    coordinates: string
  }) => void
  error?: string
  className?: string
}

interface AddressOption {
  label: string
  value: string
}

export const geoSuggest = async (value: string) => {
  const YA_GEO_SUGGEST_API = '4bc3aa0b-11a8-4568-944a-c3ecc2403ad6'
  const response = await fetch(`https://suggest-maps.yandex.ru/v1/suggest?text=${value}&print_address=1&apikey=${YA_GEO_SUGGEST_API}`)
  const body = await response.json()
  console.log(body)
  if (!body.results) {
    return []
  }
  return body.results.map((point: any) => ({
    label: point.title.text,
    value: point.address.formatted_address,
  }))
}

export const geoCode = async (value: string) => {
  const YA_MAP_API = "e8fb8a66-5d6c-400f-ae13-024a40a5f460"
  const response = await fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=${YA_MAP_API}&geocode=${value}&format=json`)
  const body = await response.json()
  return body.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos
}

export default function AddressAutocomplete({ value, onChange, error, className }: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<AddressOption[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const searchTimeout = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleSearch = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    try {
      setIsLoading(true)
      const results = await geoSuggest(query)
      setSuggestions(results)
      setIsOpen(results.length > 0)
    } catch (error) {
      console.error('Suggestion error:', error)
      setSuggestions([])
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    searchTimeout.current = setTimeout(() => {
      handleSearch(newValue)
    }, 300)
  }

  const handleSuggestionClick = async (suggestion: AddressOption) => {
    setInputValue(suggestion.value)
    console.log(suggestion)
    const coordinates = await geoCode(suggestion.value)
    onChange({
      fullAddress: suggestion.value,
      country: 'Россия', // Default to Russia since we're using Russian geocoding
      coordinates: coordinates, // You might want to add actual coordinates if needed
    })
    setIsOpen(false)
  }

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [])

  return (
    <div className="relative">
      <div className="relative">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Введите адрес"
          className={cn(error && 'border-red-500', className)}
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.value}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
} 