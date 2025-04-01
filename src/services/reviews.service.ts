import { StaticImport } from 'next/dist/shared/lib/get-img-props'
import { API } from './api'

export interface Review {
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

export interface ReviewsResponse {
  data: Review[]
  totalCount: number
  averageRating: number
}

interface CreateReviewDto {
  content: string
  rating: number
  entityType: 'service' | 'school' | 'garden'
  serviceId: string
  createrName: string
  createrId: string
  createrAvatar?: string
}

export const ReviewsService = {
  async getSchoolReviews(schoolId: string): Promise<Review[]> {
    const response = await API.get<ReviewsResponse>(`/reviews/list?id=${schoolId}`)
    return response.data.data
  },

  async createReview(reviewData: CreateReviewDto): Promise<Review> {
    const response = await API.post<Review>('/reviews/create', reviewData)
    return response.data
  },

  async checkUserReview(schoolId: string, userId: string): Promise<boolean> {
    const response = await API.get<{ hasReview: boolean }>(
      `/reviews/check?schoolId=${schoolId}&userId=${userId}`
    )
    return response.data.hasReview
  }
} 