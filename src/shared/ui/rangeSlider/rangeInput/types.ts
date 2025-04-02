
export interface RangeInputProps {
    value: string
    handleBlur: (mode: number) => void
    handleChange: (mode: number, value: string) => void
    mode: number
    placeholder: string
  }