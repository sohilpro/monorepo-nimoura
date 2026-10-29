import type { UserProfile } from '@nimoura/shared-types';

export const useAuth = () => useState<UserProfile | null>('useAuth', () => null);
