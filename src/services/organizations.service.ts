import { API } from './api'
import { School } from './schools.service'

export class OrganizationsService {
  static async getUserOrganizations(userId: string) {
    const response = await API.get<School[]>(`/organisations/byuserid?id=${userId}`)
    return response.data
  }

  static async createOrganization(formData: FormData) {
    const response = await API.post<School>('/organisations/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
} 