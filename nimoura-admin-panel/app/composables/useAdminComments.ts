import type { CommentAdmin, PaginatedResult } from '~~/server/types/magazine';

export interface AdminCommentQuery {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected' | '';
}

export function useAdminCommentsList(query: Ref<AdminCommentQuery>) {
  return useFetch<PaginatedResult<CommentAdmin>>('/api/magazine/comments', {
    query,
    watch: [query],
    key: computed(() => `admin-comments-${JSON.stringify(query.value)}`),
  });
}

export async function moderateComment(id: string, status: 'approved' | 'rejected') {
  return $fetch(`/api/magazine/comments/${id}/status`, { method: 'PATCH', body: { status } });
}

export async function deleteComment(id: string) {
  return $fetch(`/api/magazine/comments/${id}`, { method: 'DELETE' });
}