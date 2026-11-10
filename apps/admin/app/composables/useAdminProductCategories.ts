import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@nimoura/shared-types';

export function useAdminProductCategories() {
  const toast = useAppToast();
  const { isLoading } = useLoading();

  /**
   * دریافت اطلاعات تکی یک دسته‌بندی
   */
  async function getCategoryById(id: number | string): Promise<Category | null> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>(`/api/category/${id}`, {
        method: 'GET',
      });
      return (response?.data ?? response) as Category;
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        detail:
          error?.data?.message ||
          error?.statusMessage ||
          'خطا در دریافت اطلاعات دسته‌بندی',
        life: 4000,
      });
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * ایجاد دسته‌بندی جدید
   */
  async function createCategory(payload: CreateCategoryPayload): Promise<boolean> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>('/api/category/create', {
        method: 'POST',
        body: payload,
      });

      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        detail: response?.message || 'دسته‌بندی با موفقیت ایجاد شد',
        life: 3000,
      });
      return true;
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        detail:
          error?.data?.message ||
          error?.statusMessage ||
          'خطا در ثبت دسته‌بندی جدید',
        life: 4000,
      });
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * ویرایش دسته‌بندی
   */
  async function updateCategory(
    id: number | string,
    payload: UpdateCategoryPayload,
  ): Promise<boolean> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>(`/api/category/${id}`, {
        method: 'PATCH',
        body: payload,
      });

      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        detail: response?.message || 'دسته‌بندی با موفقیت ویرایش شد',
        life: 3000,
      });
      return true;
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        detail:
          error?.data?.message ||
          error?.statusMessage ||
          'خطا در ویرایش دسته‌بندی',
        life: 4000,
      });
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * دریافت تمام دسته‌ها برای سلکتور والد (Parent Dropdown)
   */
  async function fetchParentOptions(excludeId?: number | string): Promise<Category[]> {
    try {
      const response = await $fetch<any>('/api/category/list', {
        query: { limit: 200 },
      });
      const data = response?.data ?? response;
      const categories: Category[] = data?.categories || data?.items || [];

      if (!excludeId) return categories;

      const numExcludeId = Number(excludeId);
      return categories.filter((c) => Number(c.id) !== numExcludeId);
    } catch {
      return [];
    }
  }

  return {
    getCategoryById,
    createCategory,
    updateCategory,
    fetchParentOptions,
  };
}
