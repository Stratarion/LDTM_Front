export type OrganisationType = 'school' | 'garden';
export type OrganisationStatus = 'active' | 'inactive' | 'pending';
export type SchoolType = 'state' | 'private';

export interface OrganisationPhoto {
  id: string;
  url: string;
}

export interface Organisation {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  type: OrganisationType;
  schoolType: SchoolType;
  maxCount: number;
  approach: string;
  costInfo: number;
  ownerId: string;
  createrId: string;
  status: OrganisationStatus;
  rating: number;
  reviewsCount: number;
  avatar: string;
  directorName: string;
  createdAt: string;
  updatedAt: string;
  photos: OrganisationPhoto[];
  avgRating: number;
}

export interface OrganisationFilters {
  name?: string;
  type?: OrganisationType;
  status?: OrganisationStatus;
  address?: string;
  school_type?: SchoolType;
}

interface OrganisationDTO {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  type: OrganisationType;
  school_type: SchoolType;
  max_count: number;
  approach: string;
  cost_info: number;
  owner_id: string;
  creater_id: string;
  status: OrganisationStatus;
  rating: number;
  reviews_count: number;
  avatar: string;
  director_name: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganisationDTOResponse extends OrganisationDTO {
  photos: OrganisationPhoto[];
  avgRating: number;
}

export interface OrganisationListResponse {
  data: OrganisationDTOResponse[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
} 