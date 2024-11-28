import { API } from './api'
import { User } from '@/types/user'

interface UpdateUserDto {
  name?: string
  email?: string
  avatar_url?: string
  address?: string
  phone?: string
}

export class UsersService {
  static async updateUser(userId: string, data: UpdateUserDto) {
    const response = await API.put<User>(`/user/update?id=${userId}`, data)
    return response.data
  }

  static async getUsers() {
    const response = await API.get<User[]>('/users')
    return response.data
  }

  static async getUserById(userId: string) {
    const response = await API.get<User>(`/users/${userId}`)
    return response.data
  }

  static async updateAvatar(userId: string, formData: FormData) {
    const response = await API.post<User>(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
} 