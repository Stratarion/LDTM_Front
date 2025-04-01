import { API } from './api'
import { Organization } from '@/types/organization'

interface CreateOrganizationDTO {
  name: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  director_name: string;
  type: 'school' | 'garden';
  school_type?: 'state' | 'private';
  max_count: number;
  approach?: string;
  cost_info: number;
  owner_id: string;
  creater_id: string;
}

export class OrganizationsService {
  static async getUserOrganizations(userId: string) {
    const response = await API.get<Organization[]>(`/organisations/byuserid?id=${userId}`)
    return response.data
  }

  static async createOrganization(data: CreateOrganizationDTO) {
    const response = await API.post<Organization>('/organisations/create', data)
    return response.data
  }

  static async updateOrganization(id: string, data: Partial<CreateOrganizationDTO>) {
    const response = await API.patch<{ data: Organization }>(`/organisations/update/${id}`, data)
    return response.data.data
  }

  static async deleteOrganization(id: string): Promise<void> {
    await API.delete(`/organisations/delete/${id}`)
  }
} 