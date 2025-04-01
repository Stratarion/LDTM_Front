import { API } from './api'

export interface Garden {
  id: string
  name: string
  avatar: string
  description: string
  reviewCount: number
  rating: number
  totalRating: number
  type: 'garden'
  school_type: 'state' | 'private'
  max_count: number
  approach: string
  cost_info?: number
  address: string
  gallery: string[]
  features: {
    id: string
    name: string
    icon: string
    description: string
  }[]
  createdAt: string
  ownerId: string
  createrId: string
  director_name: string
  email: string
  phone: string
}

export interface GardensResponse {
  currentPage: number
  data: Garden[]
  totalPages: number
  totalCount: number
}

export interface GardensFiltersType {
  type?: 'all' | 'state' | 'private'
  name?: string
  minRating?: number
  priceRange?: [number, number]
  city?: string
}

interface GardensRequestBody {
  page: number
  limit: number
  filters?: {
    type?: 'state' | 'private'
    name?: string
    minRating?: number
    minPrice?: number
    maxPrice?: number
    city?: string
  }
}

export const GardensService = {
  async getGardens(
    page: number,
    limit: number,
    filters?: GardensFiltersType
  ): Promise<GardensResponse> {
    const requestBody: GardensRequestBody = {
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

    const { data } = await API.post<GardensResponse>(
      '/organisations/garden',
      requestBody
    )
    return data
  },

  async getGardenById(id: string): Promise<Garden> {
    const { data } = await API.get<Garden>(`/organisations/getOrganisationById?id=${id}`)
    return data
  }
} 