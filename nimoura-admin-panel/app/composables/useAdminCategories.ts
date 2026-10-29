import type { Category } from '~~/server/types/magazine';

export interface CategoryFormPayload {
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string | null;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
}

export function useAdminCategoriesList() {
  return useFetch<Category[]>('/api/magazine/categories/flat', {
    key: 'admin-categories-list',
  });
}

export async function createCategory(payload: CategoryFormPayload) {
  return $fetch<Category>('/api/magazine/categories', { method: 'POST', body: payload });
}

export async function updateCategory(id: string, payload: Partial<CategoryFormPayload>) {
  return $fetch<Category>(`/api/magazine/categories/${id}`, { method: 'PATCH', body: payload });
}

export async function deleteCategory(id: string) {
  return $fetch(`/api/magazine/categories/${id}`, { method: 'DELETE' });
}