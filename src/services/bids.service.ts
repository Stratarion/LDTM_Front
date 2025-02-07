import { API } from './api'
import { Schedule } from './schedule.service'
import { Service } from './services.service'
import { User } from '@/types/user'

export interface Bid {
  id: string
  userId: string
  user_id: string
  scheduleId: string
  schedule_id: string
  status: 'active' | 'cancelled'
  createdAt: string
  updatedAt: string
  schedule?: {
    id: string
    date: string
    startTime: string
    endTime: string
    service: Service
  }
  user?: {
    id: string
    first_name: string
    last_name: string
  }
}

interface BidsResponse {
  data: Bid[]
  count: number
}

export class BidsService {
  static async createBid(data: {
    userId: string
    scheduleId: string
  }): Promise<Bid> {
    const response = await API.post<Bid>('/bids/create', data)
    return response.data
  }

  static async getUserBids(userId: string): Promise<Bid[]> {
    const response = await API.get<BidsResponse>(`/bids/user?userId=${userId}`)
    return response.data.data
  }

  static async getScheduleBids(scheduleId: string): Promise<Bid[]> {
    const response = await API.get<BidsResponse>(`/bids/schedule?scheduleId=${scheduleId}`)
    return response.data.data
  }

  static async cancelBid(data: { id: string; userId: string }): Promise<void> {
    await API.post('/bids/cancel', data)
  }
} 