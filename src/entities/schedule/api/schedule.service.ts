import { API } from '@/shared/api'
import { IScheduleResponse } from '../model/IScheduleResponse'
import { IUser } from '@/entities/user/model/IUser'
import { ISchedule } from '../model/ISchedule'
import { IScheduleEvent } from '../model/iScheduleEvent'

export interface CreateEventDto {
  date: string
  startTime: string
  serviceId: string
  teacherId?: string
  maxStudents: number
  ownerId: string
}



export class ScheduleService {
  static async getEvents(userId: string, startDate: string, endDate: string) {
    const response = await API.get<IScheduleResponse>(
      `/schedule/events?userId=${userId}&startDate=${startDate}&endDate=${endDate}`
    )
    return response.data
  }

  static async createEvent(data: CreateEventDto) {
    const response = await API.post<IScheduleEvent>('/schedule/create', data)
    return response.data
  }

  static async updateEvent(eventId: string, data: Partial<CreateEventDto>) {
    const response = await API.put<IScheduleEvent>(`/schedule/${eventId}`, data)
    return response.data
  }

  static async cancelEvent(eventId: string) {
    const response = await API.post<IScheduleEvent>(`/schedule/${eventId}/cancel`)
    return response.data
  }

  static async getTeachers(query: string) {
    const response = await API.get<IUser[]>(`/users/teachers?query=${query}`)
    return response.data
  }

  static async getScheduleByServiceId(serviceId: string): Promise<ISchedule[]> {
    const response = await API.get<IScheduleResponse>(`/schedule/service?serviceId=${serviceId}`)
    return response.data.data
  }
} 