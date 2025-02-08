import { API } from './api'
import { Review } from './reviews.service'

export interface Sport {
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
  category?: string
  subcategory?: string
  name?: string
  minRating?: number
  price?: [number, number] | undefined
  address?: string
  ageRange?: [number, number] | undefined
}

interface SportRequestBody {
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
    sportType?: SportTypes
  }
}

export const SportsService = {
  async getSports(
    page: number,
    limit: number,
    filters?: SportFiltersType
  ): Promise<SportResponse> {
    const requestBody: SportRequestBody = {
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
        ...(filters?.maxStudents && { maxStudents: filters.maxStudents }),
        ...(filters?.sportType && { sportType: filters.sportType })
      }
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