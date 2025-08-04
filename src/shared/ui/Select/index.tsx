'use client'

import { ISelect } from "./models/ISelect"

export const Select = ({
  label,
  options,
  value,
  handleChange,
}: ISelect) => {
  return (
    <div>
      <label className="text-sm font-medium text-gray-900">{label}</label>
      <select
        value={value as string}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5CD2C6] focus:border-transparent text-gray-900"
      >
        {options.map(item => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </select>
    </div>
  )
}