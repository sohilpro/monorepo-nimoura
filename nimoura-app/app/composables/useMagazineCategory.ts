import type { Category, Tag } from '~~/server/types/magazine';

export function useMagazineCategoriesTree() {
  return useFetch<Category[]>('/api/magazine/categories', {
    key: 'magazine-categories-tree',
  });
}

export function useCategoriesFlat() {
  return useFetch<Category[]>('/api/magazine/categories/flat', {
    key: 'magazine-categories-flat',
  });
}

export function useTagsList() {
  return useFetch<Tag[]>('/api/magazine/tags', {
    key: 'magazine-tags-list',
  });
}