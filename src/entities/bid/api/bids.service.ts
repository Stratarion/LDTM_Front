import { API } from '@/shared/api'
import { IBid } from '../model/IBid'
import { IBidsResponse } from '../model/IBidsResponse'

export class BidsService {
  static async createBid(data: {
    userId: string
    scheduleId: string
  }): Promise<IBid> {
    const response = await API.post<IBid>('/bids/create', data)
    return response.data
  }

  static async getUserBids(userId: string): Promise<IBid[]> {
    const response = await API.get<IBidsResponse>(`/bids/user?userId=${userId}`)
    return response.data.data
  }

  static async getScheduleBids(scheduleId: string): Promise<IBid[]> {
    const response = await API.get<IBidsResponse>(`/bids/schedule?scheduleId=${scheduleId}`)
    return response.data.data
  }

  static async cancelBid(data: { id: string; userId: string }): Promise<void> {
    await API.post('/bids/cancel', data)
  }

  static async getUserSchedule(userId: string): Promise<IBid[]> {
    const response = await API.get<IBidsResponse>(`/bids/user-schedule?userId=${userId}`)
    return response.data.data
  }
} 