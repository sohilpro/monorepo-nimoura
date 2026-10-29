import type { UserProfile } from '@nimoura/shared-types';

export type Auth = UserProfile;

export const useAuth = () => {
  return useState<UserProfile | null>('auth', () => null);
};
