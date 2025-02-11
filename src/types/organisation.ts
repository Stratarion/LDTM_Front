export type OrganisationType = 'school' | 'sport' | 'art' | 'other';
export type OrganisationStatus = 'active' | 'inactive' | 'pending' | 'rejected';
export type SchoolType = 'state' | 'private' | 'other';

export interface OrganisationPhoto {
  id: string;
  url: string;
}

export interface Organisation {
  id: string;
  name: string;
  type: OrganisationType;
  status: OrganisationStatus;
  address: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  
  // Дополнительные поля
  approach: string;
  avatar: string;
  avgRating: number;
  cost_info: number;
  creater_id: string;
  director_name: string;
  email: string;
  max_count: number;
  owner_id: string;
  phone: string;
  photos: OrganisationPhoto[];
  rating: number;
  reviews_count: number;
  school_type: SchoolType;
  website: string;
}

export interface OrganisationFilters {
  name?: string;
  type?: OrganisationType;
  status?: OrganisationStatus;
  address?: string;
  school_type?: SchoolType;
}

export interface OrganisationListResponse {
  data: Organisation[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
} 