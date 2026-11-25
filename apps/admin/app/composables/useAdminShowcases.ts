import type {
  ShowcaseConfig,
  CreateShowcaseConfigPayload,
  UpdateShowcaseConfigPayload,
} from '@nimoura/shared-types';

export function useAdminShowcases() {
  const toast = useAppToast();
  const isLoading = ref(false);
  const items = ref<ShowcaseConfig[]>([]);

  function normalizeList(payload: any): ShowcaseConfig[] {
    const root = payload?.data ?? payload;
    const list = Array.isArray(root)
      ? root
      : (root?.items ?? root?.data ?? []);
    return Array.isArray(list) ? list : [];
  }

  async function fetchShowcases(): Promise<ShowcaseConfig[]> {
    isLoading.value = true;
    try {
      const response: any = await $fetch('/api/showcase-config');
      items.value = normalizeList(response);
      return items.value;
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        detail: error?.data?.message || error?.statusMessage || 'خطا در دریافت ویترینها',
        life: 4000,
      });
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchShowcase(id: number | string): Promise<ShowcaseConfig | null> {
    try {
      const response: any = await $fetch(`/api/showcase-config/${id}`);
      return (response?.data ?? response) as ShowcaseConfig;
    } catch {
      return null;
    }
  }

  async function createShowcase(payload: CreateShowcaseConfigPayload): Promise<ShowcaseConfig | null> {
    isLoading.value = true;
    try {
      const response: any = await $fetch('/api/showcase-config', {
        method: 'POST',
        body: payload,
      });
      toast.add({ severity: 'success', summary: 'موفقیت', detail: 'ویترین ایجاد شد', life: 3000 });
      return (response?.data ?? response) as ShowcaseConfig;
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        detail: error?.data?.message || error?.statusMessage || 'خطا در ایجاد ویترین',
        life: 4000,
      });
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateShowcase(
    id: number | string,
    payload: UpdateShowcaseConfigPayload,
  ): Promise<boolean> {
    isLoading.value = true;
    try {
      await $fetch(`/api/showcase-config/${id}`, { method: 'PUT', body: payload });
      toast.add({ severity: 'success', summary: 'موفقیت', detail: 'ویترین بهروزرسانی شد', life: 3000 });
      return true;
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        detail: error?.data?.message || error?.statusMessage || 'خطا در ذخیره ویترین',
        life: 4000,
      });
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteShowcase(id: number | string): Promise<boolean> {
    isLoading.value = true;
    try {
      await $fetch(`/api/showcase-config/${id}`, { method: 'DELETE' });
      toast.add({ severity: 'success', summary: 'موفقیت', detail: 'ویترین حذف شد', life: 3000 });
      return true;
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        detail: error?.data?.message || error?.statusMessage || 'خطا در حذف ویترین',
        life: 4000,
      });
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchCategories(): Promise<any[]> {
    try {
      const response: any = await $fetch('/api/category', { query: { limit: 300 } });
      const root = response?.data ?? response;
      const list = Array.isArray(root) ? root : (root?.items ?? root?.data ?? []);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  return {
    items,
    isLoading,
    fetchShowcases,
    fetchShowcase,
    createShowcase,
    updateShowcase,
    deleteShowcase,
    fetchCategories,
  };
}
