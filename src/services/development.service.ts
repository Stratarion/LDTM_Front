import { API } from './api'

export interface Development {
  id: string
  name: string
  avatar: string
  description: string
  reviewCount: number
  rating: number
  totalRating: number
  type: 'development'
  schoolType: 'state' | 'private'
  maxCount: number
  approach: string
  costInfo?: number
  address: string
  gallery: string[]
  features: {
    id: string
    name: string
    icon: string
    description: string
  }[]
  schedule: {
    days: string[]
    timeStart: string
    timeEnd: string
  }
  ageFrom: number
  ageTo: number
  createdAt: string
  ownerId: string
  createrId: string
  director_name: string
  email: string
  phone: string
}

export interface DevelopmentResponse {
  currentPage: number
  data: Development[]
  totalPages: number
  totalCount: number
}

export type DevelopmentTypes = 
  | 'chess'
  | 'programming'
  | 'robotics'
  | 'mathematics'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'languages'
  | 'art'
  | 'music'

export interface DevelopmentFiltersType {
  type?: 'all' | 'state' | 'private'
  developmentType?: DevelopmentTypes
  name?: string
  minRating?: number
  priceRange?: [number, number]
  city?: string
  ageRange?: [number, number]
  maxParticipants?: number
}

interface DevelopmentRequestBody {
  page: number
  limit: number
  filters?: {
    type?: 'state' | 'private'
    name?: string
    minRating?: number
    minPrice?: number
    maxPrice?: number
    city?: string
    minAge?: number
    maxAge?: number
    maxParticipants?: number
    developmentType?: DevelopmentTypes
  }
}

export const DevelopmentService = {
  async getDevelopments(
    page: number,
    limit: number,
    filters?: DevelopmentFiltersType
  ): Promise<DevelopmentResponse> {
    const requestBody: DevelopmentRequestBody = {
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
        ...(filters?.ageRange && {
          minAge: filters.ageRange[0],
          maxAge: filters.ageRange[1]
        }),
        ...(filters?.maxParticipants && { maxParticipants: filters.maxParticipants }),
        ...(filters?.developmentType && { developmentType: filters.developmentType })
      }
    }

    const { data } = await API.post<DevelopmentResponse>(
      `/services/development/list`,
      requestBody
    )
    return data
  },

  async getDevelopmentById(id: string): Promise<Development> {
    const { data } = await API.get<Development>(`/organisations/getOrganisationById?id=${id}`)
    return data
  }
} 