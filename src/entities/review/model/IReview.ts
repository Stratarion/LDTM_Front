import { StaticImport } from "next/dist/shared/lib/get-img-props"
import { TEntity } from "./TEntity"
export interface IReview {
  creater_id: string
  creater_avatar: string | StaticImport
  creater_name: string
  id: string
  content: string
  rating: number
  org_id: string
  createdAt: string
  likes_count: number
  replies_count: number
  entityType: TEntity
}