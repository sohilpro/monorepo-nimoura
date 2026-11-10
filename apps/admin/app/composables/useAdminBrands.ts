import type {
  Brand,
  CreateBrandPayload,
  UpdateBrandPayload,
} from '@nimoura/shared-types';

export function useAdminBrands() {
  const toast = useAppToast();
  const { isLoading } = useLoading();

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

  return {
    getBrandById,
    createBrand,
    updateBrand,
  };
}
