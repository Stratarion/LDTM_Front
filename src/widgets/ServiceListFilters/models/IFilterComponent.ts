import { IServiceFilters } from "@/entities/service/model/IServiceFilters";
import { IServiceListFilter } from "./IServiceListFilter";

export interface IFilterComponent<K extends keyof IServiceFilters> {
  filter: IServiceListFilter<K>;
  value: IServiceFilters[K];
  handleChange: ({obj, newValue}: {obj: K, newValue: IServiceFilters[K]}) => void;
}