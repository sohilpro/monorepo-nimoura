import type {
  Brand,
  CreateBrandPayload,
  UpdateBrandPayload,
  PaginatedResponse,
} from '@nimoura/shared-types';

export interface BrandQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
}

export function useAdminBrands() {
  const toast = useAppToast();
  const { isLoading } = useLoading();

  /**
   * دریافت لیست برندها با صفحه‌بندی، سورت و جستجو
   */
  async function getBrandsList(
    params: BrandQueryParams = {},
  ): Promise<PaginatedResponse<Brand>> {
    try {
      const response = await $fetch<any>('/api/brand/list', {
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
      const items = data?.items ?? data?.brands ?? [];
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
          'خطا در دریافت لیست برندها',
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
   * دریافت مشخصات یک برند با شناسه
   */
  async function getBrandById(id: number | string): Promise<Brand | null> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>(`/api/brand/${id}`, {
        method: 'GET',
      });
      return (response?.data ?? response) as Brand;
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        detail:
          error?.data?.message ||
          error?.statusMessage ||
          'خطا در دریافت مشخصات برند',
        life: 4000,
      });
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * ایجاد برند جدید
   */
  async function createBrand(payload: CreateBrandPayload): Promise<boolean> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>('/api/brand/create', {
        method: 'POST',
        body: payload,
      });

      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        detail: response?.message || 'برند با موفقیت ایجاد شد',
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
          'خطا در ثبت برند جدید',
        life: 4000,
      });
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * ویرایش مشخصات برند
   */
  async function updateBrand(
    id: number | string,
    payload: UpdateBrandPayload,
  ): Promise<boolean> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>(`/api/brand/${id}`, {
        method: 'PATCH',
        body: payload,
      });

      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        detail: response?.message || 'برند با موفقیت ویرایش شد',
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
          'خطا در ذخیره تغییرات برند',
        life: 4000,
      });
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * حذف برند
   */
  async function deleteBrand(id: number | string): Promise<boolean> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>(`/api/brand/${id}`, {
        method: 'DELETE',
      });

      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        detail: response?.message || 'برند با موفقیت حذف شد',
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
          'خطا در حذف برند',
        life: 4000,
      });
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    getBrandsList,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
  };
}
