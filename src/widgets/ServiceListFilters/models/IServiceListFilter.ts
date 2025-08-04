import { IServiceFilters } from "@/entities/service/model/IServiceFilters";
import { IOption } from "@/shared/ui/Select/models/IOption";

export interface IServiceListFilter<K extends keyof IServiceFilters> {
  label: string;
  obj: K;
  type: "text" | "select" | "range";
  placeholder: string;
  options?: IOption[];
  min?: number;
  max?: number;
  step?: number;
}