'use client'

import { useState, useEffect } from 'react'

interface RangeSliderProps {
  min: number
  max: number
  step?: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  formatValue?: (value: number) => string
}

export default function RangeSlider({
  min,
  max,
  value,
  onChange,
}: RangeSliderProps) {
  const [inputValues, setInputValues] = useState({
    min: value[0].toString(),
    max: value[1].toString()
  })

  useEffect(() => {
    setInputValues({
      min: value[0].toString(),
      max: value[1].toString()
    })
  }, [value])

  const handleInputChange = (index: number, value: string) => {
    const newInputValues = index === 0 
      ? { ...inputValues, min: value }
      : { ...inputValues, max: value }
    setInputValues(newInputValues)
  }

  const handleInputBlur = (index: number) => {
    const value = index === 0 ? inputValues.min : inputValues.max
    let numValue = Number(value.replace(/[^0-9]/g, ''))
    
    // Ограничиваем значения
    numValue = Math.max(min, Math.min(max, numValue))
    
    const newValues = [...value] as [number, number]
    newValues[index] = numValue

    // Убедимся, что минимальное значение не больше максимального
    if (index === 0) {
      newValues[0] = Math.min(numValue, Number(inputValues.max))
      newValues[1] = Number(inputValues.max)
    } else {
      newValues[0] = Number(inputValues.min)
      newValues[1] = Math.max(numValue, Number(inputValues.min))
    }

    onChange(newValues)
  }

  return (
    <div className="flex items-center gap-4">
      <input
        type="text"
        value={inputValues.min}
        onChange={(e) => handleInputChange(0, e.target.value)}
        onBlur={() => handleInputBlur(0)}
        className="w-[120px] h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
        placeholder="От"
      />
      <span className="text-gray-400">—</span>
      <input
        type="text"
        value={inputValues.max}
        onChange={(e) => handleInputChange(1, e.target.value)}
        onBlur={() => handleInputBlur(1)}
        className="w-[120px] h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
        placeholder="До"
      />
    </div>
  )
} 