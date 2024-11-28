import { API } from './api'

export interface Review {
  id: string
  content: string
  rating: number
  createdAt: string
  createrName: string
  createrId: string
  createrAvatar?: string
  likesCount: number
  repliesCount: number
}

export interface ReviewsResponse {
  data: Review[]
  totalCount: number
  averageRating: number
}

export interface CreateReviewDto {
  content: string
  rating: number
  createrName: string
  createrId: string
  createrAvatar?: string
  schoolId: string
}

export class ReviewsService {
  static async getSchoolReviews(schoolId: string) {
    const response = await API.get<ReviewsResponse>(`/reviews/list?id=${schoolId}`)
    return response.data
  }

  static async createReview(reviewData: CreateReviewDto) {
    const response = await API.post<Review>('/reviews/create', reviewData)
    return response.data
  }

  static async checkUserReview(schoolId: string, userId: string) {
    const response = await API.get<{ hasReview: boolean }>(`/reviews/check`, {
      params: { schoolId, userId }
    })
    return response.data.hasReview
  }
} 