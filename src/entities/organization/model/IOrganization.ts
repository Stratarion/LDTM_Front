import { IPhoto } from "@/entities/photo/model/IPhoto";
import { TOrganization, TOrganizationStatus, TSchool } from "./TOrtganization";

export interface IOrganization {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  type: TOrganization;
  school_type: TSchool;
  max_count: number;
  approach: string;
  cost_info: number;
  owner_id: string;
  creater_id: string;
  status: TOrganizationStatus;
  rating: number;
  reviews_count: number;
  avatar: string;
  director_name: string;
  createdAt: string;
  updatedAt: string;
  photos: IPhoto[];
  avgRating: number;
}