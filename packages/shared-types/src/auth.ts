import { UserRole } from './enums';

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
  createdAt?: string | Date;
  updatedAt?: string | Date;
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
