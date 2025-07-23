import { API } from '@/shared/api'
import { IReviewsResponse } from '../model/IReviewsResponse'
import { IReviewCreate } from '../model/IReviewCreate'
import { IReview } from '../model/IReview'

export const ReviewsService = {
  async getSchoolReviews(schoolId: string): Promise<IReview[]> {
    const response = await API.get<IReviewsResponse>(`/reviews/list?id=${schoolId}`)
    return response.data.data
  },

  async createReview(reviewData: IReviewCreate): Promise<IReview> {
    const response = await API.post<IReview>('/reviews/create', reviewData)
    return response.data
  },

  async checkUserReview(schoolId: string, userId: string): Promise<boolean> {
    const response = await API.get<{ hasReview: boolean }>(
      `/reviews/check?schoolId=${schoolId}&userId=${userId}`
    )
    return response.data.hasReview
  }
} 