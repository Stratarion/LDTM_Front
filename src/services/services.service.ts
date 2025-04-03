import { API } from '../shared/api'
import { Service, ServiceListResponse, ServiceStatus, ServiceFilters } from '@/shared/types/service'

export interface CreateServiceDTO {
  name: string;
  description?: string;
  category: string;
  price?: number;
  duration: number;
  organisation_id: string;
}

export interface ServiceFiltersType {
  name?: string
  address?: string
  category?: string
  subcategory?: string
  minRating?: number
  price?: [number, number]
  ageRange?: [number, number]
}

export const ServicesService = {
  getAdminList: async (page: number, filters?: ServiceFilters) => {
    const response = await API.post<ServiceListResponse>('/services/admin/all', {
      filters
    }, {
      params: { page }
    })
    return response.data
  },

  updateServiceStatus: async (id: string, status: ServiceStatus) => {
    const response = await API.patch<Service>(`/services/admin/status/${id}`, { status })
    return response.data
  },

  activateService: async (ids: string[]) => {
    const promises = ids.map(id => 
      API.patch<Service>(`/services/admin/activate/${id}`)
    )
    return Promise.all(promises)
  },

  getUserServices: async (org_id: string, category: string): Promise<Service[]> => {
    const response = await API.get<{ data: Service[] }>(
      `/services/byuserandtype?org_id=${org_id}&category=${category}`
    )
    return response.data.data
  },

  createService: async (data: CreateServiceDTO) => {
    const response = await API.post<Service>('/services/create', data)
    return response.data
  },

  updateService: async (id: string, data: Partial<CreateServiceDTO>) => {
    const response = await API.patch<{ data: Service }>(`/services/update/${id}`, data)
    return response.data.data
  },

  deleteService: async (id: string): Promise<void> => {
    await API.delete(`/services/delete/${id}`)
  },

  getServiceById: async (id: string): Promise<Service> => {
    const response = await API.get<Service>(`/services/${id}`)
    return response.data
  }
} 