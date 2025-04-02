export interface RangeSliderProps {
    min: number
    max: number
    step?: number
    value: [number, number]
    onChange: (value: [number, number]) => void
    formatValue?: (value: number) => string
  }