import type { Tag } from '~~/server/types/magazine';

export function useAdminTagsList() {
  return useFetch<Tag[]>('/api/magazine/tags', { key: 'admin-tags-list' });
}

export async function createTag(name: string) {
  return $fetch<Tag>('/api/magazine/tags', { method: 'POST', body: { name } });
}

export async function updateTag(id: string, name: string) {
  return $fetch<Tag>(`/api/magazine/tags/${id}`, { method: 'PATCH', body: { name } });
}

export async function deleteTag(id: string) {
  return $fetch(`/api/magazine/tags/${id}`, { method: 'DELETE' });
}