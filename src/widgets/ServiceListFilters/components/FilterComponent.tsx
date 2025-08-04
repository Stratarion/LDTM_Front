'use client'

import { IServiceFilters } from "@/entities/service/model/IServiceFilters";
import { IFilterComponent } from "../models/IFilterComponent";
import { Input } from '@/shared/ui/input'
import { Select } from "@/shared/ui/Select"
import { Range } from "@/shared/ui/Range"
export const FilterComponent = <K extends keyof IServiceFilters>({ 
  filter, 
  value, 
  handleChange 
}: IFilterComponent<K>) => {
  const handleSimpleChange = (newValue: string) => {
    handleChange({
      obj: filter.obj,
      newValue: newValue as IServiceFilters[K]
    });
  };

  const handleRangeChange = (field: 'min' | 'max', val: string) => {
    const numValue = val ? Number(val) : undefined;
    const currentValue = (value || {}) as { min?: number, max?: number };
    
    const newValue = {
      ...currentValue,
      [field]: numValue,
    };

    handleChange({
      obj: filter.obj,
      newValue: newValue as IServiceFilters[K]
    });
  };

  if (filter.type === "select") {
    if (!filter.options) return;
    return (
      <div className="space-y-2">
        <Select
          label={filter.label}
          value={value as string}
          handleChange={handleSimpleChange}
          options={filter.options}
        />
      </div>
    );
  }

  if (filter.type === "range") {
    const rangeValue = (value || {}) as { min?: number, max?: number };
    if (!filter.min || !filter.max || !filter.step) return
    return (
      <div className="space-y-4">
        <Range
          label={filter.label}
          handleChange={handleRangeChange}
          min={filter.min}
          max={filter.max}
          step={filter.step}
          value={rangeValue}
        />
        <label className="text-sm font-medium text-gray-900 block">
          {filter.label}
        </label>
        <div className="flex items-center gap-4">
          <Input
            type="number"
            placeholder={filter.label}
            value={rangeValue.min ?? ""}
            onChange={(e) => handleRangeChange('min', e.target.value)}
            min={filter.min}
            max={filter.max}
            step={filter.step}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5CD2C6] focus:border-transparent text-gray-900 placeholder-gray-500"
          />
          <span className="text-gray-500">—</span>
          <Input
            type="number"
            placeholder={filter.label}
            value={rangeValue.max ?? ""}
            onChange={(e) => handleRangeChange('max', e.target.value)}
            min={filter.min}
            max={filter.max}
            step={filter.step}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5CD2C6] focus:border-transparent text-gray-900 placeholder-gray-500"
          />
        </div>
      </div>
    );
  }

  // Текстовое поле
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-900">{filter.label}</label>
      <Input
        type="text"
        placeholder={filter.placeholder}
        value={value as string}
        onChange={(e) => handleSimpleChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5CD2C6] focus:border-transparent text-gray-900 placeholder-gray-500"
      />
    </div>
  );
};