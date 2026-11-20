import { UserRole } from '@nimoura/shared-types';

export type PermissionKey =
  | 'tickets:delete'
  | 'loyalty:manage'
  | 'users:manage_roles'
  | 'users:delete'
  | 'newsletter:broadcast'
  | 'products:manage'
  | 'orders:manage'
  | 'comments:manage'
  | 'tickets:reply'
  | 'banners:manage'
  | 'magazine:manage'
  | 'categories:manage';

export const usePermissions = () => {
  const auth = useAuth();

  const isOwner = computed(() => auth.value?.role === UserRole.OWNER);
  const isAdmin = computed(() => auth.value?.role === UserRole.ADMIN);
  const isStaff = computed(() => isOwner.value || isAdmin.value);

  const roleLabel = computed(() => {
    if (isOwner.value) return 'مالک فروشگاه';
    if (isAdmin.value) return 'مدیر سیستم';
    if (auth.value?.role === UserRole.USER) return 'کاربر عادی';
    return 'مهمان';
  });

  const can = (permission: PermissionKey | string): boolean => {
    if (!auth.value) return false;

    // مالک تمام اختیارات را به صورت نامحدود دارد
    if (isOwner.value) return true;

    // موارد فوق حساس که فقط در انحصار مالک هستند
    const ownerOnlyPermissions: string[] = [
      'tickets:delete',
      'loyalty:manage',
      'users:manage_roles',
      'users:delete',
      'newsletter:broadcast',
    ];

    if (ownerOnlyPermissions.includes(permission)) {
      return false;
    }

    // سایر عملیات‌های مدیریتی برای ادمین مجاز است
    return isAdmin.value;
  };

  return {
    auth,
    isOwner,
    isAdmin,
    isStaff,
    roleLabel,
    can,
  };
};
