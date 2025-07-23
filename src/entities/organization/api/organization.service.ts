import { API } from '@/shared/api'
import { IOrganizationCreate } from '../model/IOrganizationCreate'
import { IOrganization } from '../model/IOrganization'
import { IOrganizationListResponse } from '../model/IOrganizationListResponse'
import { IOrganizationFilters } from '../model/IOrganizationFilters'

export const OrganizationsService = {
  getAdminList: async (page: number, filters?: IOrganizationFilters) => {
    const response = await API.post<IOrganizationListResponse>('/organizations/admin/all', {
      filters
    }, {
      params: { page }
    })
    return response.data
  },

  updateOrganization: async (id: string, data: Partial<IOrganization>) => {
    const response = await API.put<IOrganization>(`/organizations/${id}`, data)
    return response.data
  },

  activateOrganization: async (ids: string[]) => {
    const promises = ids.map(id => 
      API.patch<IOrganization>(`/organizations/admin/activate/${id}`)
    )
    return Promise.all(promises)
  },

  
  getUserOrganizations: async (userId: string) => {
    const response = await API.get<IOrganization[]>(`/organizations/byuserid?id=${userId}`)
    return response.data
  },

  createOrganization: async (data: IOrganizationCreate) => {
    const response = await API.post<IOrganization>('/organizations/create', data)
    return response.data
  },

  patchOrganization: async (id: string, data: Partial<IOrganizationCreate>) => {
    const response = await API.patch<{ data: IOrganization }>(`/organizations/update/${id}`, data)
    return response.data.data
  },

  deleteOrganization: async (id: string): Promise<void> => {
    await API.delete(`/organizations/delete/${id}`)
  }
} 