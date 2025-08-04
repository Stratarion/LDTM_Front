import { IRange } from './models/IRange';
import { Input } from '@/shared/ui/input'
export const Range = ({
  value,
  max,
  min,
  label,
  handleChange,
  step
}: IRange) => {
  return (
    <div>
      <label className="text-sm font-medium text-gray-900 block">{label}</label>
      <div className="flex items-center gap-4">
        <Input
          type="number"
          placeholder={label}
          value={value.min ?? ""}
          onChange={(e) => handleChange('min', e.target.value)}
          min={min}
          max={max}
          step={step}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5CD2C6] focus:border-transparent text-gray-900 placeholder-gray-500"
        />
        <span className="text-gray-500">—</span>
        <Input
          type="number"
          placeholder={label}
          value={value.max ?? ""}
          onChange={(e) => handleChange('max', e.target.value)}
          min={min}
          max={max}
          step={step}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5CD2C6] focus:border-transparent text-gray-900 placeholder-gray-500"
        />
      </div>
    </div>
  )
}