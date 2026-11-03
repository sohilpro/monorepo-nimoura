import { UserRole } from './enums.js';

export interface JwtPayload {
  sub: number;
  phone: string;
  email?: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: number;
  phone: string;
  email?: string;
  role: UserRole;
}

export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  mobile: string;
  verify_mobile: boolean;
  email?: string;
  verify_email: boolean;
  identity_card?: string;
  role: UserRole;
  ordersCount?: number;
  addressesCount?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AdminUserListItem {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  mobile: string;
  email?: string | null;
  role: UserRole;
  verify_mobile: boolean;
  verify_email: boolean;
  identity_card?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface CreateUserPayload {
  mobile: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  identity_card?: string;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  mobile?: string;
  identity_card?: string;
}

export interface SendOtpDto {
  mobile: string;
}

export interface CheckOtpDto {
  mobile: string;
  code: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}
