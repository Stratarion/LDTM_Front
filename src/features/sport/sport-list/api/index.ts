import { API } from '@/shared/api'
import { SportFiltersType, Sport } from '@/shared/types/sport'
import { SportListResponse, SportListRequestBody } from '../lib/types'

export const SportListService = {
  async getSports(
    page: number,
    limit: number,
    filters?: SportFiltersType,
    mapCenter?: [number, number]
  ): Promise<SportListResponse> {
    const requestBody: SportListRequestBody = {
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

    const { data } = await API.post<SportListResponse>(
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