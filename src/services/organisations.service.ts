import { API } from './api'
import { Organisation, OrganisationFilters, OrganisationListResponse } from '@/types/organisation'

export const OrganisationsService = {
  getAdminList: async (page: number, filters?: OrganisationFilters) => {
    const response = await API.post<OrganisationListResponse>('/organisations/admin/all', {
      filters
    }, {
      params: { page }
    })
    return response.data
  },

  updateOrganisation: async (id: string, data: Partial<Organisation>) => {
    const response = await API.put<Organisation>(`/organisations/${id}`, data)
    return response.data
  },

  activateOrganisation: async (ids: string[]) => {
    const promises = ids.map(id => 
      API.patch<Organisation>(`/organisations/admin/activate/${id}`)
    )
    return Promise.all(promises)
  }
} 