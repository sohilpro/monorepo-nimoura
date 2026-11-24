import type {
  MediaItem,
  MediaQueryFilter,
  MediaStats,
  UpdateMediaPayload,
  ReassignOwnerPayload,
} from '@nimoura/shared-types';

export function useAdminMedia() {
  const toast = useAppToast();
  const isLoading = ref(false);
  const isStatsLoading = ref(false);
  const items = ref<MediaItem[]>([]);
  const stats = ref<MediaStats | null>(null);
  const meta = ref({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  /**
   * دریافت لیست فایل‌ها و تصاویر با فیلترها و صفحه‌بندی
   */
  async function fetchMedia(params: MediaQueryFilter = {}) {
    isLoading.value = true;
    try {
      const response = await $fetch<any>('/api/media', {
        method: 'GET',
        query: params,
      });

      // شکل پاسخ بسته به نسخه بکند متفاوت است؛ آرایه را مطمئن پیدا میکنیم
      const root: any = response?.data ?? response;
      const list = Array.isArray(root)
        ? root
        : (root?.items ?? root?.data?.items ?? root?.data ?? []);
      items.value = Array.isArray(list) ? list : [];
      const responseMeta = root?.meta ?? root?.data?.meta;
      if (responseMeta) {
        meta.value = { ...meta.value, ...responseMeta };
      }
      return root;
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.statusMessage || 'خطا در بارگذاری لیست فایل‌ها',
      );
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * دریافت اطلاعات آماری دیسک و دیتابیس فایل‌ها
   */
  async function fetchStats() {
    isStatsLoading.value = true;
    try {
      const response = await $fetch<any>('/api/media/stats', {
        method: 'GET',
      });
      const data = (response?.data ?? response) as MediaStats;
      stats.value = data;
      return data;
    } catch (err: any) {
      // عدم نمایش ارور شدید برای آمار
      console.error('Error fetching media stats:', err);
      return null;
    } finally {
      isStatsLoading.value = false;
    }
  }

  /**
   * ویرایش مشخصات یا تغییر مالکیت و تایپ یک فایل
   */
  async function updateMedia(id: number, payload: UpdateMediaPayload): Promise<boolean> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>(`/api/media/${id}`, {
        method: 'PATCH',
        body: payload,
      });

      toast.success(response?.message || 'مشخصات فایل با موفقیت ویرایش شد');
      return true;
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.statusMessage || 'خطا در ویرایش مشخصات فایل',
      );
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * حذف یک فایل بر اساس شناسه
   */
  async function deleteMedia(id: number): Promise<boolean> {
    isLoading.value = true;
    try {
      await $fetch<any>(`/api/media/${id}`, {
        method: 'DELETE',
      });

      toast.success('فایل مورد نظر با موفقیت حذف شد');
      return true;
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.statusMessage || 'خطا در حذف فایل',
      );
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * حذف دسته‌جمعی فایل‌ها بر اساس شناسه‌ها
   */
  async function bulkDeleteMedia(ids: number[]): Promise<boolean> {
    if (!ids || ids.length === 0) return false;
    isLoading.value = true;
    try {
      const response = await $fetch<any>('/api/media/bulk-delete', {
        method: 'POST',
        body: { ids },
      });

      const count = response?.deletedCount ?? ids.length;
      toast.success(`${count} فایل با موفقیت حذف شدند`);
      return true;
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.statusMessage || 'خطا در حذف دسته‌جمعی فایل‌ها',
      );
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * انتساب مجدد مالکیت فایل‌ها (Reassign Owner)
   */
  async function reassignOwner(payload: ReassignOwnerPayload): Promise<boolean> {
    isLoading.value = true;
    try {
      await $fetch<any>('/api/media/reassign', {
        method: 'PATCH',
        body: payload,
      });

      toast.success('مالکیت فایل‌ها با موفقیت تغییر یافت');
      return true;
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.statusMessage || 'خطا در تغییر مالکیت فایل‌ها',
      );
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * آپلود مستقیم فایل جدید به فولدر uploads
   */
  async function uploadFiles(
    files: File[],
    ownerType: string,
    ownerId: string,
  ): Promise<boolean> {
    if (!files || files.length === 0) return false;
    isLoading.value = true;
    try {
      const formData = new FormData();
      formData.append('ownerType', ownerType);
      formData.append('ownerId', ownerId);

      for (const file of files) {
        formData.append('files', file);
      }

      await $fetch<any>('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      toast.success(
        files.length > 1
          ? `${files.length} فایل با موفقیت آپلود شدند`
          : 'فایل با موفقیت آپلود شد',
      );
      return true;
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.statusMessage || 'خطا در آپلود فایل',
      );
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    items,
    meta,
    stats,
    isLoading,
    isStatsLoading,
    fetchMedia,
    fetchStats,
    updateMedia,
    deleteMedia,
    bulkDeleteMedia,
    reassignOwner,
    uploadFiles,
  };
}
