// src/common/auth/jwt.types.ts
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  OWNER = 'owner',
}

export interface JwtPayload {
  sub: number; // شناسه کاربر (User ID)
  phone: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: number;
  phone: string;
  email: string;
  role: UserRole;
}
