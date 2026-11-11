import type {
  CreateTagGroupPayload,
  CreateTagPayload,
  Tag,
  TagGroup,
  UpdateTagGroupPayload,
  UpdateTagPayload,
} from '@nimoura/shared-types';

export interface TagListResult {
  items: Tag[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const unwrap = <T>(response: any): T => (response?.data !== undefined ? response.data : response) as T;

/** Admin API for product tag groups and tags. Every call returns null (after a toast) on failure. */
export function useProductTags() {
  const toast = useAppToast();

  const errorMessage = (e: any): string =>
    e?.data?.statusMessage || e?.statusMessage || e?.data?.message || 'خطایی رخ داد. دوباره تلاش کنید.';

  async function run<T>(fn: () => Promise<T>, success?: string): Promise<T | null> {
    try {
      const result = await fn();
      if (success) toast.success(success);
      return result;
    } catch (e) {
      toast.error(errorMessage(e));
      return null;
    }
  }

  const listGroups = () =>
    run(async () => unwrap<Array<TagGroup & { tagCount: number }>>(await $fetch<any>('/api/product-tags/groups')));

  /** All active groups (even empty ones) with their active tags - for pickers. */
  const getOptions = () =>
    run(async () => unwrap<TagGroup[]>(await $fetch<any>('/api/product-tags/options')));

  const createGroup = (payload: CreateTagGroupPayload) =>
    run(
      async () => unwrap<TagGroup>(await $fetch<any>('/api/product-tags/groups', { method: 'POST', body: payload })),
      'گروه ایجاد شد.',
    );

  const updateGroup = (id: number, payload: UpdateTagGroupPayload) =>
    run(
      async () => unwrap<TagGroup>(await $fetch<any>(`/api/product-tags/groups/${id}`, { method: 'PATCH', body: payload })),
      'گروه ذخیره شد.',
    );

  const deleteGroup = (id: number) =>
    run(async () => unwrap<any>(await $fetch<any>(`/api/product-tags/groups/${id}`, { method: 'DELETE' })), 'گروه حذف شد.');

  const reorderGroups = (ids: number[]) =>
    run(async () => unwrap<any>(await $fetch<any>('/api/product-tags/groups/reorder', { method: 'PUT', body: { ids } })));

  const listTags = (query: { groupId?: number; q?: string; page?: number; limit?: number }) =>
    run(async () => unwrap<TagListResult>(await $fetch<any>('/api/product-tags', { query })));

  const addTag = (payload: CreateTagPayload) =>
    run(
      async () => unwrap<Tag>(await $fetch<any>('/api/product-tags', { method: 'POST', body: payload })),
      'تگ ایجاد شد.',
    );

  const addTagsBulk = (groupId: number, names: string[]) =>
    run(async () => unwrap<Tag[]>(await $fetch<any>('/api/product-tags/bulk', { method: 'POST', body: { groupId, names } })));

  const editTag = (id: number, payload: UpdateTagPayload) =>
    run(async () => unwrap<Tag>(await $fetch<any>(`/api/product-tags/${id}`, { method: 'PATCH', body: payload })));

  const removeTag = (id: number) =>
    run(async () => unwrap<any>(await $fetch<any>(`/api/product-tags/${id}`, { method: 'DELETE' })), 'تگ حذف شد.');

  const mergeTags = (sourceId: number, targetId: number) =>
    run(
      async () => unwrap<Tag>(await $fetch<any>('/api/product-tags/merge', { method: 'POST', body: { sourceId, targetId } })),
      'تگ‌ها ادغام شدند.',
    );

  const reorderTags = (ids: number[]) =>
    run(async () => unwrap<any>(await $fetch<any>('/api/product-tags/reorder', { method: 'PUT', body: { ids } })));

  return {
    listGroups,
    getOptions,
    createGroup,
    updateGroup,
    deleteGroup,
    reorderGroups,
    listTags,
    addTag,
    addTagsBulk,
    editTag,
    removeTag,
    mergeTags,
    reorderTags,
  };
}
