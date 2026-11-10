import {
  type UpdateOrderAdminPayload,
  OrderStatus,
} from '@nimoura/shared-types';

export function useAdminOrders() {
  const toast = useAppToast();
  const { isLoading } = useLoading();

  /**
   * به‌روزرسانی مشخصات سفارش (اقلام، مبالغ، گیرنده، وضعیت)
   */
  async function updateOrder(id: number | string, payload: UpdateOrderAdminPayload): Promise<boolean> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>(`/api/orders/${id}`, {
        method: 'PATCH',
        body: payload,
      });

      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        detail: response?.message || 'سفارش با موفقیت به‌روزرسانی شد',
        life: 3000,
      });

      return true;
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        detail: error?.data?.message || error?.statusMessage || 'خطا در ویرایش سفارش',
        life: 4000,
      });
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * ترجمه وضعیت سفارش به فارسی
   */
  function getStatusLabel(status: OrderStatus | string): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'در انتظار پرداخت';
      case OrderStatus.PAID:
        return 'پرداخت شده';
      case OrderStatus.PROCESSING:
        return 'در حال پردازش و آماده‌سازی';
      case OrderStatus.SHIPPED:
        return 'ارسال شده';
      case OrderStatus.DELIVERED:
        return 'تحویل داده شده';
      case OrderStatus.CANCELLED:
        return 'لغو شده';
      default:
        return status || 'نامشخص';
    }
  }

  /**
   * کلاس‌های رنگی استایل برچسب وضعیت
   */
  function getStatusBadgeClass(status: OrderStatus | string): string {
    switch (status) {
      case OrderStatus.PAID:
      case OrderStatus.DELIVERED:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case OrderStatus.SHIPPED:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case OrderStatus.PENDING:
      case OrderStatus.PROCESSING:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case OrderStatus.CANCELLED:
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  return {
    updateOrder,
    getStatusLabel,
    getStatusBadgeClass,
  };
}
