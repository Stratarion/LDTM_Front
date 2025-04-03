import { API } from '../shared/api'

export interface Bid {
  id: string
  status: 'active' | 'cancelled'
  createdAt: string
  schedule?: {
    id: string
    date: string
    startTime: string  // "10:00:00"
    service: {
      id: string
      name: string
      description: string
      max_students: number
      duration: number
    }
    teacher: {
      id: string
      first_name: string
      last_name: string
    }
    activeBidsCount: number
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

  static async getUserSchedule(userId: string): Promise<Bid[]> {
    const response = await API.get<BidsResponse>(`/bids/user-schedule?userId=${userId}`)
    return response.data.data
  }
} 