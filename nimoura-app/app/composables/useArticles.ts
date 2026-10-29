import type { Article, ArticleQuery, PaginatedResult } from '~~/server/types/magazine';

export function useArticleList(query: Ref<ArticleQuery> | ArticleQuery) {
  const q = isRef(query) ? query : ref(query);

  const { data, pending, error, refresh } = useFetch<PaginatedResult<Article>>(
    '/api/magazine/articles',
    {
      query: q,
      watch: [q],
      key: computed(() => `articles-${JSON.stringify(q.value)}`),
    },
  );

  return { articles: data, pending, error, refresh };
}

export function useArticleDetail(slug: string | Ref<string>) {
  const slugRef = isRef(slug) ? slug : ref(slug);

  const { data, pending, error } = useFetch<{ article: Article; related: Article[] }>(
    () => `/api/magazine/articles/${slugRef.value}`,
    { key: computed(() => `article-${slugRef.value}`) },
  );

  return { article: computed(() => data.value?.article), related: computed(() => data.value?.related ?? []), pending, error };
}

export async function toggleArticleLike(articleId: string) {
  return $fetch<{ liked: boolean; likeCount: number }>(
    `/api/magazine/articles/${articleId}/like`,
    { method: 'POST' },
  );
}