import { IReview } from "./reviews";

export type ServiceCategory = 'sport' | 'development' | 'art' | 'education' | 'other';
export type ServiceStatus = 'active' | 'inactive' | 'pending' | 'rejected';

export type DevelopmentType = 'language' | 'math' | 'programming' | 'robotics' | 'science' | 'other';

export interface ServicePhoto {
  id: string;
  url: string;
}

export interface ServiceReview {
  rating: number;
}

export interface ServiceAddress {
  full: string;
  coordinates?: number[];
}

export interface IService {
  id: string;
  name: string;
  description: string;
  address: string;
  category: ServiceCategory;
  coordinates: string;
  subcategory: string;
  phone: string;
  email: string;
  age_from: number;
  age_to: number;
  price: string;
  duration: number;
  max_students: number;
  org_id: string;
  teacher_id: string | null;
  status: ServiceStatus;
  rating: number;
  reviews_count: number;
  image: string | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;

  // Additional fields
  photos: ServicePhoto[];
  reviews: IReview[];
  avgRating: number;
}

export interface ServiceFilters {
  name?: string;
  category?: ServiceCategory;
  status?: ServiceStatus;
  minPrice?: number;
  maxPrice?: number;
  development_type?: DevelopmentType;
  skill_level?: 'beginner' | 'intermediate' | 'advanced';
  learning_format?: 'individual' | 'group' | 'both';
}

export interface ServiceListResponse {
	currentPage: number
	data: IService[]
	totalPages: number
	totalCount: number
}

export interface CreateServiceDTO {
  name: string;
  description?: string;
  category: string;
  price?: number;
  duration: number;
  organisation_id: string;
}

export interface ServiceFiltersType {
  name?: string
  address?: string
  category?: string
  subcategory?: string
  minRating?: number
  price?: [number, number]
  ageRange?: [number, number]
}

export interface BaseListRequestBody<TFilters = undefined> {
  page: number
  limit: number
  filters?: TFilters
  mapCenter?: [number, number]
}

export interface SportListFilters {
  name?: string
  address?: string
  category?: string
  subcategory?: string
  minRating?: number
  minPrice?: number
  maxPrice?: number
  minAge?: number
  maxAge?: number
  radius?: number
}

export type SportListRequestBody = BaseListRequestBody<SportListFilters>