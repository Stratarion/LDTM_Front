import { API } from './api'
import { User } from '@/shared/types/user'

interface UpdateUserDto {
  name?: string
  email?: string
  avatar_url?: string
  address?: string
  phone?: string
  role?: string
}

interface PaginationData {
  totalItems: number
  totalPages: number
  currentPage: number
  itemsPerPage: number
}

interface GetUserListResponse {
  data: User[]
  pagination: PaginationData
}

export const UsersService = {
  updateUser: async (userId: string, data: UpdateUserDto) => {
    const response = await API.put<User>(`/user/update?id=${userId}`, data)
    return response.data
  },

  getUsers: async () => {
    const response = await API.get<User[]>('/user')
    return response.data
  },

  getUserById: async (userId: string) => {
    const response = await API.get<User>(`/user/${userId}`)
    debugger;
    return response.data
  },

  updateAvatar: async (userId: string, formData: FormData) => {
    const response = await API.post<User>(`/user/avatar?id=${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getUserList: async (page: number) => {
    const response = await API.get<GetUserListResponse>(`/user/getUserList?page=${page}`)
    return response.data
  },

  getCurrentUser: async (userId: string) => {
    const { data } = await API.get<User>(`/user/${userId}`)
    return data
  }
} 