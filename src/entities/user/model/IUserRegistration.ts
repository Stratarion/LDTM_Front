import { TUserRole } from "./TUser";

export interface IUserRegistration {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: TUserRole;
  address?: string;
}