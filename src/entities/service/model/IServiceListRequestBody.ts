import { ICoordinates } from "@/shared/lib/types/ICoordinates";
import { IServiceFilters } from "./IServiceFilters";

export interface IServiceListRequestBody {
  page: number;
  limit: number;
  filters: IServiceFilters;
  mapCenter?: ICoordinates;
}