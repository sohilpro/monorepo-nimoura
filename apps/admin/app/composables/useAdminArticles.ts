import type { Article, ArticleStatus, PaginatedResult } from '~~/server/types/magazine';

export interface AdminArticleQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ArticleStatus | '';
  categoryId?: string;
  authorId?: string;
}

export interface ArticleFormPayload {
  title: string;
  summary: string;
  content: string;
  coverImage?: string;
  coverImageAlt?: string;
  status: ArticleStatus;
  isFeatured?: boolean;
  authorId: string;
  categoryId: string;
  tagIds?: string[];
  relatedProductIds?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export function useAdminArticleList(query: Ref<AdminArticleQuery>) {
  const { data, pending, error, refresh } = useFetch<PaginatedResult<Article>>(
    '/api/magazine/articles',
    {
      query,
      watch: [query],
      key: computed(() => `admin-articles-${JSON.stringify(query.value)}`),
    },
  );
  return { articles: data, pending, error, refresh };
}

export async function fetchAdminArticle(id: string) {
  return $fetch<Article>(`/api/magazine/articles/${id}`);
}

export async function createArticle(payload: ArticleFormPayload) {
  return $fetch<Article>('/api/magazine/articles', {
    method: 'POST',
    body: payload,
  });
}

export async function updateArticle(id: string, payload: Partial<ArticleFormPayload>) {
  return $fetch<Article>(`/api/magazine/articles/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteArticle(id: string) {
  return $fetch(`/api/magazine/articles/${id}`, { method: 'DELETE' });
}
