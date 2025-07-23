import { IServiceFilters } from "./IServiceFilters";

export interface IServiceListRequestBody {
  page: number;
  limit: number;
  filters: IServiceFilters;
  mapCenter?: [number, number]
}