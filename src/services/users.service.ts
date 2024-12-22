import { API } from './api'
import { User } from '@/types/user'

interface UpdateUserDto {
  name?: string
  email?: string
  avatar_url?: string
  address?: string
  phone?: string
  userType?: string
}

export const UsersService = {
  updateUser: async (userId: string, data: UpdateUserDto) => {
    const response = await API.put<User>(`/user/update?id=${userId}`, data)
    return response.data
  },

  getUsers: async () => {
    const response = await API.get<User[]>('/users')
    return response.data
  },

  getUserById: async (userId: string) => {
    const response = await API.get<User>(`/users/${userId}`)
    debugger;
    return response.data
  },

  updateAvatar: async (userId: string, formData: FormData) => {
    const response = await API.post<User>(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getCurrentUser: async (userId: string) => {
    const { data } = await API.get<User>(`/user/${userId}`)
    return data
  }
} 