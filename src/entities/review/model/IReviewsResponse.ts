import { IReview } from "@/shared/types/reviews"

export interface IReviewsResponse {
  data: IReview[]
  totalCount: number
  averageRating: number
}