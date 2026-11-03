import {
  type AdminUserListItem,
  type UserProfile,
  type CreateUserPayload,
  type UpdateUserPayload,
  type PaginatedResponse,
  UserRole,
} from '@nimoura/shared-types';

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
}

export function useAdminUsers() {
  const toast = useAppToast();
  const { isLoading } = useLoading();

  /**
   * دریافت لیست کاربران و مشتریان با صفحه‌بندی و جستجو
   */
  async function getUsersList(
    params: UserQueryParams = {},
  ): Promise<PaginatedResponse<AdminUserListItem>> {
    try {
      const response = await $fetch<any>('/api/user/list', {
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
      const items = data?.items ?? data?.users ?? [];
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
          'خطا در بارگذاری لیست کاربران',
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
   * حذف کاربر
   */
  async function deleteUser(id: number | string): Promise<boolean> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>(`/api/user/${id}`, {
        method: 'DELETE',
      });

      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        detail: response?.message || 'کاربر با موفقیت حذف شد',
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
          'خطا در حذف کاربر',
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
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case UserRole.ADMIN:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case UserRole.USER:
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  return {
    getUsersList,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getRoleLabel,
    getRoleBadgeClass,
  };
}
