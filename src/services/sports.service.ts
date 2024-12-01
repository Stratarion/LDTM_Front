import { API } from './api'

export interface Sport {
  id: string
  name: string
  avatar: string
  description: string
  reviewCount: number
  rating: number
  totalRating: number
  type: 'sport'
  schoolType: 'state' | 'private'
  maxStudents: number
  approach: string
  price: number
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
  duration: number
  createdAt: string
  ownerId: string
  createrId: string
  director_name: string
  email: string
  phone: string
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
  type?: 'all' | 'state' | 'private'
  sportType?: SportTypes
  name?: string
  minRating?: number
  priceRange?: [number, number]
  city?: string
  ageRange?: [number, number]
  maxStudents?: number
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
    const { data } = await API.get<Sport>(`/organisations/getOrganisationById?id=${id}`)
    return data
  }
} 