import { TUserRole, TUserStatus } from "./TUser";

export interface IUser {
  id: string;
  email: string;
  role: TUserRole;
  address: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar: string | null;
  status: TUserStatus;
  last_login: string | null;
  email_verified: boolean;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}