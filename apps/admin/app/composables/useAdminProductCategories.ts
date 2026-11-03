import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  PaginatedResponse,
} from '@nimoura/shared-types';

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
}

export function useAdminProductCategories() {
  const toast = useAppToast();
  const { isLoading } = useLoading();

  /**
   * دریافت لیست صفحه‌بندی‌شده دسته‌بندی‌ها
   */
  async function getCategoriesList(
    params: CategoryQueryParams = {},
  ): Promise<PaginatedResponse<Category>> {
    try {
      const response = await $fetch<any>('/api/category/list', {
        method: 'GET',
        query: {
          page: params.page || 1,
          limit: params.limit || 15,
          search: params.search || undefined,
          sortBy: params.sortBy || 'id',
          sortOrder: params.sortOrder || 'DESC',
        },
      });

      const data = response?.data ?? response;
      const items = data?.items ?? data?.categories ?? [];
      const total = data?.total ?? items.length;
      const page = data?.page ?? params.page ?? 1;
      const limit = data?.limit ?? params.limit ?? 15;
      const totalPages = data?.totalPages ?? Math.ceil(total / limit);

      return {
        items,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        detail:
          error?.data?.message ||
          error?.statusMessage ||
          'خطا در دریافت لیست دسته‌بندی‌ها',
        life: 4000,
      });
      return {
        items: [],
        total: 0,
        page: 1,
        limit: 15,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }
  }

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
   * حذف دسته‌بندی
   */
  async function deleteCategory(id: number | string): Promise<boolean> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>(`/api/category/${id}`, {
        method: 'DELETE',
      });

      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        detail: response?.message || 'دسته‌بندی با موفقیت حذف شد',
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
          'خطا در حذف دسته‌بندی',
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
      const all: Category[] = data?.items ?? data?.categories ?? [];

      if (!excludeId) return all;
      const numExcludeId = Number(excludeId);
      return all.filter((c) => c.id !== numExcludeId);
    } catch {
      return [];
    }
  }

  return {
    getCategoriesList,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchParentOptions,
  };
}
