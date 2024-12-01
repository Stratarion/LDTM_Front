import { API } from './api'
import { Service } from './services.service'
import { User } from '@/types/user'

export interface ScheduleEvent {
  id: string
  date: string
  startTime: string
  endTime: string
  serviceId: string
  service: Service
  teacherId: string
  teacher: User
  ownerId: string
  owner: User
  maxParticipants: number
  currentParticipants: number
  participants: User[]
  status: 'active' | 'cancelled'
  createdAt: string
}

export interface ScheduleResponse {
  data: ScheduleEvent[]
  totalCount: number
}

export interface CreateEventDto {
  date: string
  startTime: string
  serviceId: string
  teacherId: string
  maxParticipants: number
  ownerId: string
}

export class ScheduleService {
  static async getEvents(userId: string, startDate: string, endDate: string) {
    const response = await API.get<ScheduleResponse>(
      `/schedule/events?userId=${userId}&startDate=${startDate}&endDate=${endDate}`
    )
    return response.data
  }

  static async createEvent(data: CreateEventDto) {
    const response = await API.post<ScheduleEvent>('/schedule/create', data)
    return response.data
  }

  static async updateEvent(eventId: string, data: Partial<CreateEventDto>) {
    const response = await API.put<ScheduleEvent>(`/schedule/${eventId}`, data)
    return response.data
  }

  static async cancelEvent(eventId: string) {
    const response = await API.post<ScheduleEvent>(`/schedule/${eventId}/cancel`)
    return response.data
  }

  static async getTeachers(query: string) {
    const response = await API.get<User[]>(`/users/teachers?query=${query}`)
    return response.data
  }
} 