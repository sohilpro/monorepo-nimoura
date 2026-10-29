import type { Comment } from '~~/server/types/magazine';

export function useArticleComments(articleId: Ref<string>) {
  const { data, pending, refresh } = useFetch<Comment[]>('/api/magazine/comments', {
    query: { articleId },
    watch: [articleId],
    key: computed(() => `comments-${articleId.value}`),
  });

  return { comments: data, pending, refresh };
}

export interface NewCommentPayload {
  name: string;
  email: string;
  content: string;
  articleId: string;
  parentId?: string;
}

export async function submitComment(payload: NewCommentPayload) {
  return $fetch('/api/magazine/comments', {
    method: 'POST',
    body: payload,
  });
}