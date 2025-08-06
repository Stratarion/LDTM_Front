import { ICoordinates } from "@/shared/lib/types/ICoordinates";
import { IServiceFilters } from "./IServiceFilters";
import { TServiceCategory } from "./TService";

export interface IServiceListRequestBody {
  page: number;
  limit: number;
  filters: IServiceFilters;
  mapCenter?: ICoordinates;
  type: TServiceCategory;
}