import { API } from '@/shared/api'
import { ISport } from '@/shared/types/sport'

export const SportDetailsService = {
	async getSportById(id: string): Promise<ISport> {
    const { data } = await API.get<ISport>(`/services/${id}`)
    return data
  }
} 