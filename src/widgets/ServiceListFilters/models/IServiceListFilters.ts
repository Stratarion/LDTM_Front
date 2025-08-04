import { IServiceFilters } from "@/entities/service/model/IServiceFilters"
import { IServiceListFilter } from "./IServiceListFilter";

export interface IServiceListFilters {
  initialFilters: IServiceFilters;
  onFilterChange: (filters: IServiceFilters) => void;
  filtersList: IServiceListFilter<keyof IServiceFilters>[]
}