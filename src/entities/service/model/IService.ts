import { IPhoto } from "@/entities/photo/model/IPhoto";
import { TServiceCategory, TServiceStatus } from "./TService";
import { IReview } from "@/entities/review/model/IReview";

export interface IService {
  id: string;
  name: string;
  description: string;
  address: string;
  category: TServiceCategory;
  coordinates: number[];
  subcategory: string;
  phone: string;
  email: string;
  age_from: number;
  age_to: number;
  price: string;
  duration: number;
  max_students: number;
  org_id: string;
  teacher_id: string | null;
  status: TServiceStatus;
  rating: number;
  reviews_count: number;
  image: string | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;

  // Additional fields
  photos: IPhoto[];
  reviews: IReview[];
  avgRating: number;
}