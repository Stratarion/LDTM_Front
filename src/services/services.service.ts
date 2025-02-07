import { API } from './api'
import { Photo } from './photos.service'

export type ServiceType = 'sport' | 'development'

export interface Service {
  id: string
  name: string
  description: string
  category: ServiceType
  price: number
  age_from: number
  age_to: number
  duration: number
  max_students: number
  address: string
  org_id: string
  teacher_id?: string
  status: 'active' | 'inactive' | 'deleted'
  rating: number
  reviews_count: number
  image?: string
  phone?: string
  email?: string
  subcategory?: string
  mainPhoto?: {
    id: string
    url: string
    description?: string
  } | null
  photos?: Photo[]
}

export interface ServicesResponse {
  data: Service[]
  totalCount: number
}

export interface CreateServiceDTO {
  name: string
  description: string
  category: ServiceType
  price: number
  max_students: number
  age_from: number
  status?: string
  age_to: number
  address: string
  org_id: string
  teacher_id?: string
}

export class ServicesService {
  static async getUserServices(org_id: string, category: string): Promise<Service[]> {
    const response = await API.get<ServicesResponse>(
      `/services/byuserandtype?org_id=${org_id}&category=${category}`
    )
    return response.data.data
  }

  static async createService(data: CreateServiceDTO) {
    const response = await API.post<Service>('/services/create', data)
    return response.data
  }

  static async updateService(id: string, data: Partial<CreateServiceDTO>) {
    const response = await API.patch<{ data: Service }>(`/services/update/${id}`, data)
    return response.data.data
  }

  static async deleteService(id: string): Promise<void> {
    await API.delete(`/services/delete/${id}`)
  }

  static async getServiceById(id: string): Promise<Service> {
    const response = await API.get<Service>(`/services/${id}`)
    return response.data
  }
} 