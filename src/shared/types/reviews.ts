import { StaticImport } from 'next/dist/shared/lib/get-img-props'

export interface IReview {
    creater_id: string
    creater_avatar: string | StaticImport
    creater_name: string
    id: string
    content: string
    rating: number
    organizationId: string
    organizationType: 'school' | 'garden'
    createdAt: string
    likes_count: number
    replies_count: number
  }