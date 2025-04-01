export type OrganizationType = 'school' | 'garden'
export type SchoolType = 'state' | 'private'
export type OrganizationStatus = 'active' | 'inactive' | 'pending'

export interface Organization {
  id: string
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  type: OrganizationType
  school_type: SchoolType
  max_count: number
  approach?: string
  cost_info?: number
  owner_id: string
  creater_id: string
  status: OrganizationStatus
  rating: number
  reviews_count: number
  avatar?: string
  director_name: string
} 