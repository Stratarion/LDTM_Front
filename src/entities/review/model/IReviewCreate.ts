export interface IReviewCreate {
  content: string
  rating: number
  entityType: 'service' | 'school' | 'garden'
  serviceId: string
  createrName: string
  createrId: string
  createrAvatar?: string
}