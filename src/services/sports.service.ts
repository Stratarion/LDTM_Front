import { API } from './api'
import { Review } from './reviews.service'

export interface Sport {
  ageRange: any
  type: any
  maxStudents: any
  reviews: Review[]
  features: any
  id: string
  name: string
  description: string | null
  category: 'sport' | string
  subcategory: string
  price: string
  duration: number
  max_students: number
  age_from: number
  age_to: number
  address: string
  image: string
  images: string[]
  rating: number
  reviews_count: number
  status: 'active' | 'inactive'
  phone: string
  email: string
}

export interface SportResponse {
  currentPage: number
  data: Sport[]
  totalPages: number
  totalCount: number
}

export type SportTypes = 
  | 'football'
  | 'basketball'
  | 'volleyball'
  | 'tennis'
  | 'swimming'
  | 'martial_arts'
  | 'gymnastics'
  | 'athletics'
  | 'dance'
  | 'other'

export interface SportFiltersType {
  name?: string
  address?: string
  category?: string
  subcategory?: string
  minRating?: number
  price?: [number, number]
  age?: number
  ageRange?: [number, number]
  radius?: number
  coordinates?: [number, number]
  mapCenter?: [number, number]
}

interface SportRequestBody {
  page: number
  limit: number
  filters?: {
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
  mapCenter?: [number, number]
}

export const SportsService = {
  async getSports(
    page: number,
    limit: number,
    filters?: SportFiltersType,
    mapCenter?: [number, number]
  ): Promise<SportResponse> {
    const requestBody: SportRequestBody = {
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
        }),
        ...(filters?.radius && { radius: filters.radius })
      },
      mapCenter
    }

    const { data } = await API.post<SportResponse>(
      `/services/sport/list`,
      requestBody
    )
    return data
  },

  async getSportById(id: string): Promise<Sport> {
    const { data } = await API.get<Sport>(`/services/${id}`)
    return data
  }
} 