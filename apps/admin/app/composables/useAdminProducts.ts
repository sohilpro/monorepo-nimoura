import type {
  Product,
  AdminProductListItem,
  CreateProductPayload,
  UpdateProductPayload,
  PaginatedResponse,
  Category,
  Brand,
} from '@nimoura/shared-types';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC';
  isAvailable?: boolean;
  categoryId?: number;
  brandId?: number;
}

export function useAdminProducts() {
  const toast = useAppToast();
  const { isLoading } = useLoading();

  /**
   * دریافت لیست صفحه‌بندی‌شده محصولات برای جدول مدیریت
   */
  async function getProductsList(params: ProductQueryParams = {}): Promise<PaginatedResponse<AdminProductListItem>> {
    try {
      const response = await $fetch<any>('/api/product/list', {
        method: 'GET',
        query: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || undefined,
          sort: params.sort || 'createdAt',
          sortOrder: params.sortOrder || 'DESC',
          isAvailable: params.isAvailable,
          categoryId: params.categoryId,
          brandId: params.brandId,
        },
      });

      const data = response?.data ?? response;
      const items = data?.items ?? data?.products ?? [];
      const total = data?.total ?? data?.meta?.total ?? items.length;
      const page = data?.page ?? data?.meta?.page ?? params.page ?? 1;
      const limit = data?.limit ?? data?.meta?.limit ?? params.limit ?? 10;
      const totalPages = data?.totalPages ?? data?.meta?.totalPages ?? Math.ceil(total / limit);

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
        detail: error?.data?.message || error?.statusMessage || 'خطا در بارگذاری محصولات',
        life: 4000,
      });
      return {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }
  }

  /**
   * دریافت مشخصات یک محصول بر اساس شناسه
   */
  async function getProductById(id: number | string): Promise<Product | null> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>(`/api/product/${id}`, {
        method: 'GET',
      });
      return (response?.data ?? response) as Product;
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        detail: error?.data?.message || error?.statusMessage || 'خطا در واکشی مشخصات محصول',
        life: 4000,
      });
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * ایجاد محصول جدید
   */
  async function createProduct(payload: CreateProductPayload): Promise<boolean> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>('/api/product/create', {
        method: 'POST',
        body: payload,
      });

      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        detail: response?.message || 'محصول با موفقیت ایجاد شد',
        life: 3000,
      });

      return true;
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        detail: error?.data?.message || error?.statusMessage || 'خطا در ثبت محصول جدید',
        life: 4000,
      });
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * ویرایش محصول
   */
  async function updateProduct(id: number | string, payload: UpdateProductPayload): Promise<boolean> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>(`/api/product/${id}`, {
        method: 'PUT',
        body: payload,
      });

      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        detail: response?.message || 'محصول با موفقیت ویرایش شد',
        life: 3000,
      });

      return true;
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        detail: error?.data?.message || error?.statusMessage || 'خطا در ذخیره تغییرات محصول',
        life: 4000,
      });
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * دریافت گزینه‌های دسته‌بندی
   */
  async function fetchCategoryOptions(): Promise<Category[]> {
    try {
      const res = await $fetch<any>('/api/category/list', { query: { limit: 200 } });
      const data = res?.data ?? res;
      return data?.categories || data?.items || [];
    } catch {
      return [];
    }
  }

  /**
   * دریافت گزینه‌های برند و زیربرند
   */
  async function fetchBrandOptions(): Promise<Brand[]> {
    try {
      const res = await $fetch<any>('/api/product/brand/list', { query: { limit: 200 } });
      const data = res?.data ?? res;
      return data?.brands || data?.items || [];
    } catch {
      return [];
    }
  }

  return {
    getProductsList,
    getProductById,
    createProduct,
    updateProduct,
    fetchCategoryOptions,
    fetchBrandOptions,
  };
}
