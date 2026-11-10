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
