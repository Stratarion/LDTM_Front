export type UserRole = 'user' | 'admin' | 'provider' | 'teacher';
export type UserStatus = 'active' | 'inactive' | 'blocked';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  address: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar: string | null;
  status: UserStatus;
  last_login: string | null;
  email_verified: boolean;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: UserRole;
  address?: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface UserUpdateData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar?: string;
  notifications_enabled?: boolean;
}

export interface PasswordChangeData {
  old_password: string;
  new_password: string;
}

export interface PasswordResetRequestData {
  email: string;
}

export interface PasswordResetData {
  token: string;
  new_password: string;
} 