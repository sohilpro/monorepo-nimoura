import type { Author } from '~~/server/types/magazine';

export interface AuthorFormPayload {
  name: string;
  avatar?: string;
  jobTitle?: string;
  bio?: string;
  socialLinks?: Record<string, string>;
  isActive?: boolean;
}

export function useAdminAuthorsList() {
  return useFetch<Author[]>('/api/magazine/authors', { key: 'admin-authors-list' });
}

export async function createAuthor(payload: AuthorFormPayload) {
  return $fetch<Author>('/api/magazine/authors', { method: 'POST', body: payload });
}

export async function updateAuthor(id: string, payload: Partial<AuthorFormPayload>) {
  return $fetch<Author>(`/api/magazine/authors/${id}`, { method: 'PATCH', body: payload });
}

export async function deleteAuthor(id: string) {
  return $fetch(`/api/magazine/authors/${id}`, { method: 'DELETE' });
}