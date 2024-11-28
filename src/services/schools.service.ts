import { API } from './api';

export interface School {
  id: string;
  name: string;
  avatar: string;
  description: string;
  reviewCount: number;
  rating: number;
  totalRating: number;
  schoolType: 'state' | 'private';
  maxCount: number;
  approach: string;
  costInfo?: number;
  address: string;
  gallery: string[];
  type: 'school' | 'garden';
  features: {
    id: string;
    name: string;
    icon: string;
    description: string;
  }[];
}

interface SchoolsResponse {
  currentPage: number;
  data: School[];
  numberOfPages: number;
  totalCount: number;
}

export interface SchoolFiltersType {
  type: 'all' | 'state' | 'private';
  priceRange: [number, number] | null;
  name: string;
  minRating: number | null;
  city: string | null;
}

export interface SchoolApiFiltersType {
  type: 'all' | 'state' | 'private';
  priceRange: [number, number] | null;
  name: string;
  city: string | null;
}

interface SchoolsRequestBody {
  page: number;
  limit: number;
  filters?: {
    type?: 'state' | 'private';
    name?: string;
    minRating?: number;
    minPrice?: number;
    maxPrice?: number;
    city?: string;
  };
}

export const SchoolsService = {
  async getSchools(
    page: number = 1, 
    limit: number = 10,
    filters?: SchoolFiltersType
  ): Promise<SchoolsResponse> {
    const requestBody: SchoolsRequestBody = {
      page,
      limit,
      filters: {
        ...(filters?.type !== 'all' && { type: filters?.type }),
        ...(filters?.name && { name: filters.name }),
        ...(filters?.minRating && { minRating: filters.minRating }),
        ...(filters?.priceRange && {
          minPrice: filters.priceRange[0],
          maxPrice: filters.priceRange[1]
        }),
        ...(filters?.city && { city: filters.city }),
      }
    }

    const { data } = await API.post<SchoolsResponse>(
      '/organisations/school',
      requestBody
    );
    return data;
  },

  async getSchoolById(id: string): Promise<School> {
    const { data } = await API.get<School>(`/organisations/getOrganisationById?id=${id}`)
    return data
  }
}; 