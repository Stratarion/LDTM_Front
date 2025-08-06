import { TServiceCategory } from "@/entities/service/model/TService";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface IEmptyState {
	router: AppRouterInstance;
	handleFilterChange: ({}) => void;
  serviceType: TServiceCategory;
}