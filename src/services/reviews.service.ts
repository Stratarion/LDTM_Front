import { API } from './api'
import { User } from '@/types/user'

export interface Review {
  id: string
  content: string
  rating: number
  createrName: string
  createrId: string
  createrAvatar?: string
  organizationId: string
  organizationType: 'school' | 'garden'
  createdAt: string
}

export interface ReviewsResponse {
  data: Review[]
  totalCount: number
  averageRating: number
}

interface CreateReviewDto {
  content: string
  rating: number
  createrName: string
  createrId: string
  createrAvatar?: string
  schoolId: string
}

export const ReviewsService = {
  async getSchoolReviews(schoolId: string): Promise<ReviewsResponse> {
    const response = await API.get<ReviewsResponse>(`/reviews/list?id=${schoolId}`)
    return response.data
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