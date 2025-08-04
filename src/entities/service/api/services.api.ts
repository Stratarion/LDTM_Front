import { API } from '@/shared/api'
import { IServiceFilters } from '../model/IServiceFilters'
import { IServiceListResponse } from '../model/IServiceListResponse'
import { TServiceStatus } from '../model/TService'
import { IService } from '../model/IService'
import { IServiceCreate } from '../model/IServiceCreate'
import { IServiceListRequestBody } from '../model/IServiceListRequestBody'
import { ICoordinates } from '@/shared/lib/types/ICoordinates'

export const ServicesAPI = {
  getAdminList: async (page: number, filters?: IServiceFilters) => {
    const response = await API.post<IServiceListResponse>('/services/admin/all', {
      filters
    }, {
      params: { page }
    })
    return response.data
  },

  updateServiceStatus: async (id: string, status: TServiceStatus) => {
    const response = await API.patch<IService>(`/services/admin/status/${id}`, { status })
    return response.data
  },

  activateService: async (ids: string[]) => {
    const promises = ids.map(id => 
      API.patch<IService>(`/services/admin/activate/${id}`)
    )
    return Promise.all(promises)
  },

  getUserServices: async (org_id: string, category: string): Promise<IService[]> => {
    const response = await API.get<{ data: IService[] }>(
      `/services/byuserandtype?org_id=${org_id}&category=${category}`
    )
    return response.data.data
  },

  createService: async (data: IServiceCreate) => {
    const response = await API.post<IService>('/services/create', data)
    return response.data
  },

  updateService: async (id: string, data: Partial<IServiceCreate>) => {
    const response = await API.patch<{ data: IService }>(`/services/update/${id}`, data)
    return response.data.data
  },

  deleteService: async (id: string): Promise<void> => {
    await API.delete(`/services/delete/${id}`)
  },

	getServiceById: async (id: string): Promise<IService> => {
    const response = await API.get<IService>(`/services/${id}`)
    return response.data
  },

  getServicesWithMap: async (
    page: number,
    limit: number,
    filters?: IServiceFilters,
    mapCenter?: ICoordinates,
  ): Promise<IServiceListResponse> => {
    const requestBody: IServiceListRequestBody = {
      page,
      limit,
      filters: {
        ...(filters?.name && { name: filters.name }),
        ...(filters?.address && { address: filters.address }),
        ...(filters?.category && { category: filters.category }),
        ...(filters?.subcategory && { subcategory: filters.subcategory }),
        ...(filters?.minRating && { minRating: filters.minRating }),
        ...(filters?.priceRange?.min && { minPrice: filters.priceRange.min }),
        ...(filters?.priceRange?.max && { minPrice: filters.priceRange?.max }),
        ...(filters?.ageRange?.min && { minAge: filters.ageRange?.min }),
      },
      mapCenter
    }

    const { data } = await API.post<IServiceListResponse>(
      `/services/list`,
      requestBody
    )
    return data
  }
} 