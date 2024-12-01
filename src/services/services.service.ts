import { API } from './api'

export type ServiceType = 'sport' | 'development'

export interface Service {
  id: string
  name: string
  description: string
  type: string
  price: number
  ageFrom: number
  ageTo: number
  maxParticipants: number
  address: string
  images?: string[]
  rating?: number
  reviews?: {
    id: string
    text: string
    rating: number
    author: string
    createdAt: string
  }[]
}

export interface ServicesResponse {
  data: Service[]
  totalCount: number
}

export class ServicesService {
  static async getUserServices(userId: string, type: string): Promise<Service[]> {
    const response = await API.get<ServicesResponse>(
      `/services/byuserandtype?id=${userId}&type=${type}`
    )
    return response.data.data
  }

  static async createService(formData: FormData) {
    const response = await API.post<Service>('/services/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  static async deleteService(id: string): Promise<void> {
    // Реализация метода удаления сервиса
  }
} 