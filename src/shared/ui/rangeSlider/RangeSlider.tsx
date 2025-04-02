'use client'

import { useState, useEffect } from 'react'
import { RangeInput } from './rangeInput'
import { RangeSliderProps } from './types'
import { rangeInputHard } from './constants' 

export const RangeSlider = ({
  min,
  max,
  value,
  onChange,
}: RangeSliderProps) => {
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
    const inputValue = index === 0 ? inputValues.min : inputValues.max
    let numValue = Number(inputValue.replace(/[^0-9]/g, ''))
    
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
      <RangeInput
        value={inputValues.min}
        handleBlur={handleInputBlur}
        handleChange={handleInputChange}
        placeholder={rangeInputHard.start.placeholder}
        mode={rangeInputHard.start.mode}
      />
      <span className="text-gray-400">—</span>
      <RangeInput
        value={inputValues.max}
        handleBlur={handleInputBlur}
        handleChange={handleInputChange}
        placeholder={rangeInputHard.end.placeholder}
        mode={rangeInputHard.end.mode}
      />
    </div>
  )
} 