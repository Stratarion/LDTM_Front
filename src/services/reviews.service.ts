import { API } from './api';

export interface Review {
  id: string;
  createrName: string;
  createrAvatar: string;
  createrId: string;
  orgId: string;
  rating: number;
  content: string;
  createdAt: string;
  likesCount: number;
  repliesCount: number;
}

export interface ReviewsResponse {
  data: Review[];
  totalCount: number;
  averageRating: number;
}

export interface CreateReviewDto {
  schoolId: string;
  userId: string;
  rating: number;
  content: string;
}

export interface CheckReviewResponse {
  hasReview: boolean;
  review?: {
    id: string;
    rating: number;
    content: string;
    createdAt: string;
  };
}

export const ReviewsService = {
  async createReview(data: CreateReviewDto) {
    const response = await API.post<Review>('/reviews/create', data);
    return response.data;
  },

  async getSchoolReviews(schoolId: string) {
    const response = await API.get<ReviewsResponse>(`/reviews/list?id=${schoolId}`);
    return response.data;
  },

  async checkUserReview(schoolId: string, userId: string) {
    const response = await API.get<CheckReviewResponse>(`/reviews/check?schoolId=${schoolId}&userId=${userId}`);
    return response.data.hasReview;
  }
}; 