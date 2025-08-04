export interface IRange {
  value: { min?: number, max?: number };
  min: number;
  max: number;
  handleChange: (type: "min" | "max", value: string) => void;
  label: string;
  step: number;
}