export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  OWNER = 'owner',
}

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
