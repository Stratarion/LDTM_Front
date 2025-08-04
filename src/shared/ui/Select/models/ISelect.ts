import { IOption } from "./IOption";

export interface ISelect {
  label: string;
  options: IOption[];
  value: string;
  handleChange: (value: string) => void;
}