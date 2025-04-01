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
  coordinates?: [number, number];
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  status: ServiceStatus;
  price: string;
  duration: number;
  org_id: string;
  createdAt: string;
  updatedAt: string;
  
  // Additional fields
  address: ServiceAddress;
  age_from: number;
  age_to: number;
  avgRating: number;
  email: string;
  image: string | null;
  location: string | null;
  max_students: number;
  phone: string;
  photos: ServicePhoto[];
  rating: number;
  reviews: ServiceReview[];
  reviews_count: number;
  subcategory: string | null;
  teacher_id: string | null;

  // Development specific fields
  development_type?: DevelopmentType;
  skill_level?: 'beginner' | 'intermediate' | 'advanced';
  learning_format?: 'individual' | 'group' | 'both';
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
  data: Service[];
  total: number;
  currentPage: number;
  totalPages: number;
} 