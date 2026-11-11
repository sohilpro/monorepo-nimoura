import {
  type UserProfile,
  type CreateUserPayload,
  type UpdateUserPayload,
  UserRole,
} from '@nimoura/shared-types';

export function useAdminUsers() {
  const toast = useAppToast();
  const { isLoading } = useLoading();

  /**
   * دریافت مشخصات یک کاربر بر اساس شناسه
   */
  async function getUserById(id: number | string): Promise<UserProfile | null> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>(`/api/user/${id}`, {
        method: 'GET',
      });
      return (response?.data ?? response) as UserProfile;
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        detail:
          error?.data?.message ||
          error?.statusMessage ||
          'خطا در دریافت مشخصات کاربر',
        life: 4000,
      });
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * ایجاد کاربر یا مشتری جدید توسط ادمین
   */
  async function createUser(payload: CreateUserPayload): Promise<boolean> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>('/api/user/create', {
        method: 'POST',
        body: payload,
      });

      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        detail: response?.message || 'کاربر با موفقیت ایجاد شد',
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
          'خطا در ثبت کاربر جدید',
        life: 4000,
      });
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * ویرایش مشخصات کاربر توسط ادمین
   */
  async function updateUser(
    id: number | string,
    payload: UpdateUserPayload,
  ): Promise<boolean> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>(`/api/user/${id}`, {
        method: 'PATCH',
        body: payload,
      });

      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        detail: response?.message || 'اطلاعات کاربر با موفقیت ویرایش شد',
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
          'خطا در ذخیره تغییرات کاربر',
        life: 4000,
      });
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * برچسب فارسی نقش کاربر
   */
  function getRoleLabel(role?: UserRole | string): string {
    switch (role) {
      case UserRole.OWNER:
        return 'مالک فروشگاه';
      case UserRole.ADMIN:
        return 'مدیر ارشد (ادمین)';
      case UserRole.USER:
        return 'مشتری عادی';
      default:
        return 'کاربر';
    }
  }

  /**
   * استایل برچسب نقش کاربر
   */
  function getRoleBadgeClass(role?: UserRole | string): string {
    switch (role) {
      case UserRole.OWNER:
        return 'bg-brand-100 text-brand-800 border-brand-200';
      case UserRole.ADMIN:
        return 'bg-nimoura-accent/40 text-nimoura-velvet border-nimoura-accent';
      case UserRole.USER:
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  return {
    getUserById,
    createUser,
    updateUser,
    getRoleLabel,
    getRoleBadgeClass,
  };
}
