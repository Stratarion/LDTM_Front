'use client'

import * as React from 'react'
import { RangeInputProps } from './types'

export const RangeInput = ({value, handleBlur, handleChange, mode, placeholder }: RangeInputProps) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => handleChange(mode, e.target.value)}
      onBlur={() => handleBlur(mode)}
      className="w-[120px] h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CD2C6] text-gray-900"
      placeholder={placeholder}
    />
  )
}
