import {
  type AdminUserListItem,
  type AdminUsersQuery,
  type AdminUsersSummary,
  type CreateUserAddressPayload,
  type CreateUserPayload,
  type UpdateUserAddressPayload,
  type UpdateUserPayload,
  type UserAddressItem,
  type UserProfile,
  UserRole,
} from '@nimoura/shared-types';

export interface UsersListResponse {
  items: AdminUserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  summary: AdminUsersSummary;
}

export interface UserStatsResponse {
  ordersCount: number;
  addressesCount: number;
  commentsCount: number;
}

const unwrap = <T>(response: any): T =>
  (response?.data !== undefined ? response.data : response) as T;

function extractErrorMessage(error: any, fallback: string): string {
  const raw =
    error?.data?.statusMessage ||
    error?.statusMessage ||
    error?.data?.message ||
    error?.message;
  if (Array.isArray(raw)) return raw.filter(Boolean).join('، ') || fallback;
  return typeof raw === 'string' && raw.trim() ? raw : fallback;
}

export function useAdminUsers() {
  const toast = useAppToast();
  const { isLoading } = useLoading();

  async function getUsersList(
    query: AdminUsersQuery = {},
  ): Promise<UsersListResponse> {
    const response = await $fetch<any>('/api/user/list', {
      method: 'GET',
      query: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        search: query.search?.trim() || undefined,
        sortBy: query.sortBy || 'id',
        sortOrder: query.sortOrder || 'DESC',
        role: query.role || undefined,
        verify_mobile:
          query.verify_mobile !== undefined
            ? String(query.verify_mobile)
            : undefined,
        verify_email:
          query.verify_email !== undefined
            ? String(query.verify_email)
            : undefined,
      },
    });
    const d = unwrap<any>(response) || {};
    const items = d.items ?? d.users ?? [];
    const total = Number(d.total ?? d.meta?.total ?? items.length);
    const page = Number(d.page ?? d.meta?.page ?? query.page ?? 1);
    const limit = Number(d.limit ?? d.meta?.limit ?? query.limit ?? 10);
    const totalPages = Number(
      d.totalPages ?? d.meta?.totalPages ?? Math.max(1, Math.ceil(total / limit)),
    );

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: Boolean(d.hasNextPage ?? page < totalPages),
      hasPrevPage: Boolean(d.hasPrevPage ?? page > 1),
      summary: d.summary ?? {
        total,
        users: 0,
        admins: 0,
        owners: 0,
        verifiedMobile: 0,
        verifiedEmail: 0,
      },
    };
  }

  async function getUserById(id: number | string): Promise<UserProfile | null> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>(`/api/user/${id}`, {
        method: 'GET',
      });
      return unwrap<UserProfile>(response);
    } catch (error: any) {
      toast.error(extractErrorMessage(error, 'خطا در دریافت مشخصات کاربر'));
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function getUserStats(
    id: number | string,
  ): Promise<UserStatsResponse | null> {
    try {
      const response = await $fetch<any>(`/api/user/${id}/stats`, {
        method: 'GET',
      });
      return unwrap<UserStatsResponse>(response);
    } catch {
      return null;
    }
  }

  async function createUser(
    payload: CreateUserPayload,
  ): Promise<UserProfile | null> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>('/api/user/create', {
        method: 'POST',
        body: payload,
      });
      const data = unwrap<{ message?: string; user?: UserProfile }>(response);
      toast.success(data?.message || 'کاربر با موفقیت ایجاد شد');
      return data?.user ?? (data as unknown as UserProfile);
    } catch (error: any) {
      toast.error(extractErrorMessage(error, 'خطا در ثبت کاربر جدید'));
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateUser(
    id: number | string,
    payload: UpdateUserPayload,
  ): Promise<UserProfile | null> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>(`/api/user/${id}`, {
        method: 'PATCH',
        body: payload,
      });
      const data = unwrap<{ message?: string; user?: UserProfile }>(response);
      toast.success(data?.message || 'اطلاعات کاربر با موفقیت ویرایش شد');
      return data?.user ?? (data as unknown as UserProfile);
    } catch (error: any) {
      toast.error(extractErrorMessage(error, 'خطا در ذخیره تغییرات کاربر'));
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteUser(id: number | string): Promise<boolean> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>(`/api/user/${id}`, {
        method: 'DELETE',
      });
      const data = unwrap<{ message?: string }>(response);
      toast.success(data?.message || 'کاربر با موفقیت حذف شد');
      return true;
    } catch (error: any) {
      toast.error(extractErrorMessage(error, 'خطا در حذف کاربر'));
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function bulkDeleteUsers(ids: number[]): Promise<boolean> {
    if (!ids.length) return false;
    isLoading.value = true;
    try {
      const response = await $fetch<any>('/api/user/bulk-delete', {
        method: 'POST',
        body: { ids },
      });
      const data = unwrap<{
        deleted: number;
        archived: number;
        failed: number;
        errors?: Array<{ id: number; message: string }>;
        message?: string;
      }>(response);

      if (data?.failed) {
        const firstErr = data.errors?.[0]?.message;
        toast.warn(
          firstErr
            ? `${data.deleted + data.archived} کاربر پردازش شد؛ ${data.failed} مورد ناموفق: ${firstErr}`
            : data?.message || 'برخی کاربران قابل حذف نبودند',
        );
      } else {
        toast.success(data?.message || 'کاربران انتخاب‌شده حذف شدند');
      }
      return (data?.deleted ?? 0) + (data?.archived ?? 0) > 0;
    } catch (error: any) {
      toast.error(extractErrorMessage(error, 'خطا در حذف گروهی کاربران'));
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function getUserAddresses(
    userId: number | string,
  ): Promise<UserAddressItem[]> {
    try {
      const response = await $fetch<any>(`/api/user/${userId}/addresses`, {
        method: 'GET',
        query: { limit: 50 },
      });
      const data = unwrap<{ addresses?: UserAddressItem[] }>(response);
      return data?.addresses ?? [];
    } catch {
      return [];
    }
  }

  async function createUserAddress(
    userId: number | string,
    payload: CreateUserAddressPayload,
  ): Promise<UserAddressItem | null> {
    try {
      const response = await $fetch<any>(`/api/user/${userId}/addresses`, {
        method: 'POST',
        body: payload,
      });
      const data = unwrap<{ message?: string; address?: UserAddressItem }>(
        response,
      );
      toast.success(data?.message || 'آدرس با موفقیت ثبت شد');
      return data?.address ?? null;
    } catch (error: any) {
      toast.error(extractErrorMessage(error, 'خطا در ثبت آدرس'));
      return null;
    }
  }

  async function updateUserAddress(
    addressId: number | string,
    payload: UpdateUserAddressPayload,
  ): Promise<UserAddressItem | null> {
    try {
      const response = await $fetch<any>(`/api/user/addresses/${addressId}`, {
        method: 'PATCH',
        body: payload,
      });
      const data = unwrap<UserAddressItem>(response);
      toast.success('آدرس با موفقیت ویرایش شد');
      return data;
    } catch (error: any) {
      toast.error(extractErrorMessage(error, 'خطا در ویرایش آدرس'));
      return null;
    }
  }

  async function deleteUserAddress(
    addressId: number | string,
  ): Promise<boolean> {
    try {
      await $fetch<any>(`/api/user/addresses/${addressId}`, {
        method: 'DELETE',
      });
      toast.success('آدرس با موفقیت حذف شد');
      return true;
    } catch (error: any) {
      toast.error(extractErrorMessage(error, 'خطا در حذف آدرس'));
      return false;
    }
  }

  function getDisplayName(user?: {
    first_name?: string | null;
    last_name?: string | null;
    mobile?: string | null;
  }): string {
    const full = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    return full || user?.mobile || 'کاربر بدون نام';
  }

  function getInitials(user?: {
    first_name?: string | null;
    last_name?: string | null;
    mobile?: string | null;
  }): string {
    const first = user?.first_name?.trim()?.[0] || '';
    const last = user?.last_name?.trim()?.[0] || '';
    if (first || last) return `${first}${last ? '‌' + last : ''}`.trim();
    return 'ک';
  }

  function getRoleLabel(role?: UserRole | string): string {
    switch (role) {
      case UserRole.OWNER:
        return 'مالک فروشگاه';
      case UserRole.ADMIN:
        return 'مدیر (ادمین)';
      case UserRole.USER:
        return 'مشتری';
      default:
        return 'کاربر';
    }
  }

  function getRoleBadgeClass(role?: UserRole | string): string {
    switch (role) {
      case UserRole.OWNER:
        return 'bg-brand-100 text-brand-800 border-brand-200';
      case UserRole.ADMIN:
        return 'bg-nimoura-accent/40 text-nimoura-velvet border-nimoura-accent';
      case UserRole.USER:
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  return {
    getUsersList,
    getUserById,
    getUserStats,
    createUser,
    updateUser,
    deleteUser,
    bulkDeleteUsers,
    getUserAddresses,
    createUserAddress,
    updateUserAddress,
    deleteUserAddress,
    getDisplayName,
    getInitials,
    getRoleLabel,
    getRoleBadgeClass,
  };
}
