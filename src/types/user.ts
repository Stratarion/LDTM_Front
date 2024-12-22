export type UserRole = 'admin' | 'user' | 'provider'

export interface User {
  id: string
  name: string
  email: string
  avatar_url?: string
  userType: UserRole
  isOrganisation: boolean
  address?: string
  phone?: string
} 