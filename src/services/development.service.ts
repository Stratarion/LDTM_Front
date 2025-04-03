import { API } from '../shared/api'
import { ServiceFiltersType } from './services.service'

export interface Development {
  id: string
  name: string
  description: string | null
  category: 'development' | string
  subcategory: string
  price: string
  duration: number
  max_students: number
  age_from: number
  age_to: number
  address: string
  image: string
  rating: number
  reviews_count: number
  status: 'active' | 'inactive'
  phone: string
  email: string
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
  maxStudents?: number
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
    maxStudents?: number
    developmentType?: DevelopmentTypes
  }
}

export const DevelopmentService = {
  async getDevelopments(
    page: number,
    limit: number,
    filters?: ServiceFiltersType
  ): Promise<DevelopmentResponse> {
    const requestBody: DevelopmentRequestBody = {
      page,
      limit,
      filters: {
        ...(filters?.name && { name: filters.name }),
        ...(filters?.address && { address: filters.address }),
        ...(filters?.category && { category: filters.category }),
        ...(filters?.subcategory && { subcategory: filters.subcategory }),
        ...(filters?.minRating && { minRating: filters.minRating }),
        ...(filters?.price && {
          minPrice: filters.price[0],
          maxPrice: filters.price[1]
        }),
        ...(filters?.ageRange && {
          minAge: filters.ageRange[0],
          maxAge: filters.ageRange[1]
        })
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