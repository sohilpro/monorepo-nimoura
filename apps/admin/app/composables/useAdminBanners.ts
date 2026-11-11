import {
  type Banner,
  type BannerPosition,
  type CreateBannerPayload,
  type UpdateBannerPayload,
  BannerDevice,
  BannerStatus,
} from '@nimoura/shared-types';

export function useAdminBanners() {
  const toast = useAppToast();
  const { isLoading } = useLoading();

  /**
   * دریافت اطلاعات تکی یک بنر
   */
  async function getBannerById(id: number | string): Promise<Banner | null> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>(`/api/banner/${id}`, {
        method: 'GET',
      });
      return (response?.data ?? response) as Banner;
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        detail:
          error?.data?.message ||
          error?.statusMessage ||
          'خطا در دریافت مشخصات بنر',
        life: 4000,
      });
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * ایجاد بنر جدید
   */
  async function createBanner(payload: CreateBannerPayload): Promise<boolean> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>('/api/banner/create', {
        method: 'POST',
        body: payload,
      });

      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        detail: response?.message || 'بنر با موفقیت ثبت و منتشر شد',
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
          'خطا در ایجاد بنر جدید',
        life: 4000,
      });
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * ویرایش بنر
   */
  async function updateBanner(
    id: number | string,
    payload: UpdateBannerPayload,
  ): Promise<boolean> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>(`/api/banner/${id}`, {
        method: 'PUT',
        body: payload,
      });

      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        detail: response?.message || 'بنر با موفقیت ویرایش شد',
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
          'خطا در ذخیره تغییرات بنر',
        life: 4000,
      });
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * دریافت جایگاه‌های تعریف‌شده بنر
   */
  async function fetchBannerPositions(): Promise<BannerPosition[]> {
    try {
      const response = await $fetch<any>('/api/banner/positions');
      const data = response?.data ?? response;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  /**
   * ترجمه فارسی نوع دستگاه
   */
  function getDeviceLabel(device?: BannerDevice | string): string {
    switch (device) {
      case BannerDevice.ALL:
        return 'تمام دستگاه‌ها';
      case BannerDevice.DESKTOP:
        return 'فقط دسکتاپ';
      case BannerDevice.MOBILE:
        return 'فقط موبایل';
      case BannerDevice.TABLET:
        return 'فقط تبلت';
      default:
        return 'تمام دستگاه‌ها';
    }
  }

  /**
   * برچسب فارسی وضعیت بنر
   */
  function getStatusLabel(status?: BannerStatus | string): string {
    switch (status) {
      case BannerStatus.ACTIVE:
        return 'فعال در سایت';
      case BannerStatus.INACTIVE:
        return 'غیرفعال';
      case BannerStatus.DRAFT:
        return 'پیش‌نویس';
      case BannerStatus.SCHEDULED:
        return 'زمان‌بندی‌شده';
      case BannerStatus.EXPIRED:
        return 'منقضی‌شده';
      default:
        return status || 'نامشخص';
    }
  }

  /**
   * استایل برچسب وضعیت
   */
  function getStatusBadgeClass(status?: BannerStatus | string): string {
    switch (status) {
      case BannerStatus.ACTIVE:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case BannerStatus.INACTIVE:
      case BannerStatus.EXPIRED:
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case BannerStatus.DRAFT:
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case BannerStatus.SCHEDULED:
        return 'bg-nimoura-accent/40 text-nimoura-velvet border-nimoura-accent';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  return {
    getBannerById,
    createBanner,
    updateBanner,
    fetchBannerPositions,
    getDeviceLabel,
    getStatusLabel,
    getStatusBadgeClass,
  };
}
