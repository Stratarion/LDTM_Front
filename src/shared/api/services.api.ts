import { API } from '../api'
import {
	IService,
	ServiceListResponse,
	ServiceStatus,
	ServiceFilters,
	CreateServiceDTO,
  SportListRequestBody,
} from '@/shared/types/service'
import { ISportFilters } from '../types/SportFilter'

export const ServicesAPI = {
  getAdminList: async (page: number, filters?: ServiceFilters) => {
    const response = await API.post<ServiceListResponse>('/services/admin/all', {
      filters
    }, {
      params: { page }
    })
    return response.data
  },

  updateServiceStatus: async (id: string, status: ServiceStatus) => {
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

  createService: async (data: CreateServiceDTO) => {
    const response = await API.post<IService>('/services/create', data)
    return response.data
  },

  updateService: async (id: string, data: Partial<CreateServiceDTO>) => {
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
    filters?: ISportFilters,
    mapCenter?: [number, number]
  ): Promise<ServiceListResponse> => {
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

    const { data } = await API.post<ServiceListResponse>(
      `/services/list`,
      requestBody
    )
    return data
  }
} 