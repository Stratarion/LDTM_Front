import { Service } from '@/shared/types/service'
import { API } from '../shared/api'

import { User } from '@/shared/types/user'

export interface ScheduleEvent {
  id: string
  date: string
  startTime: string
  endTime: string
  serviceId: string
  service: Service
  teacherId?: string
  teacher: User
  ownerId: string
  owner: User
  maxStudents: number
  currentParticipants: number
  participants: User[]
  status: 'active' | 'cancelled' | 'inactive'
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
  teacherId?: string
  maxStudents: number
  ownerId: string
}

export interface Schedule {
  id: string
  serviceId: string
  date: string
  startTime: string
  endTime: string
  status: 'active' | 'inactive' | 'cancelled'
  createdAt: string
  teacher: {
    id: string
    first_name: string
    last_name: string
    avatar?: string | null
  }
  currentParticipants: number
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

  static async getScheduleByServiceId(serviceId: string): Promise<Schedule[]> {
    const response = await API.get<ScheduleResponse>(`/schedule/service?serviceId=${serviceId}`)
    return response.data.data
  }
} 