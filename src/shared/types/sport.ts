import { IReview } from '@/shared/types/reviews'
export interface SportFiltersType {
  name?: string
  address?: string
  category?: string
  subcategory?: string
  minRating?: number
  price?: [number, number]
  age?: number
  ageRange?: [number, number]
  radius?: number
  coordinates?: [number, number]
  mapCenter?: [number, number]
}

export interface ISport {
  ageRange: any
  type: any
  maxStudents: any
  reviews: IReview[]
  features: any
  id: string
  name: string
  description: string | null
  category: 'sport' | string
  subcategory: string
  price: string
  duration: number
  max_students: number
  age_from: number
  age_to: number
  address: string
  image: string
  images: string[]
  rating: number
  reviews_count: number
  status: 'active' | 'inactive'
  phone: string
  email: string
}