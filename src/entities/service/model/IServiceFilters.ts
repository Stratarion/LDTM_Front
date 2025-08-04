import { TDevelopment, TServiceCategory, TServiceStatus } from "./TService";

export interface IServiceFilters {
  name?: string;
  category?: TServiceCategory;
  status?: TServiceStatus;
  address?: string
  priceRange?: {
    min?: number;
    max?: number;
  };
  ageRange?: {
    min?: number;
    max?: number;
  };
  subcategory?: string
  minRating?: number
  development_type?: TDevelopment;
  skill_level?: 'beginner' | 'intermediate' | 'advanced';
  learning_format?: 'individual' | 'group' | 'both';
}
