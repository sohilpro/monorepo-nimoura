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
  first_name?: string | null;
  last_name?: string | null;
  mobile: string;
  verify_mobile: boolean;
  email?: string | null;
  verify_email: boolean;
  identity_card?: string | null;
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
  ordersCount?: number;
  addressesCount?: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface AdminUsersSummary {
  total: number;
  users: number;
  admins: number;
  owners: number;
  verifiedMobile: number;
  verifiedEmail: number;
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
  role?: UserRole;
  verify_mobile?: boolean;
  verify_email?: boolean;
}

export interface CreateUserPayload {
  mobile: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  identity_card?: string;
  verify_mobile?: boolean;
  verify_email?: boolean;
}

export interface UpdateUserPayload {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  password?: string;
  role?: UserRole;
  mobile?: string;
  identity_card?: string | null;
  verify_mobile?: boolean;
  verify_email?: boolean;
}

export interface UserAddressItem {
  id: number;
  title: string;
  postal_code: string;
  state: string;
  city: string;
  address: string;
  userId: number;
}

export interface CreateUserAddressPayload {
  title: string;
  postal_code: string;
  state: string;
  city: string;
  address: string;
}

export type UpdateUserAddressPayload = Partial<CreateUserAddressPayload>;

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
