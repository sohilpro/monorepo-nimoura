import {
  type Order,
  type AdminOrderListItem,
  type AdminOrderStatistics,
  type UpdateOrderAdminPayload,
  type CreateOrderAdminPayload,
  type PaginatedResponse,
  OrderStatus,
} from '@nimoura/shared-types';

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus | string;
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export function useAdminOrders() {
  const toast = useAppToast();
  const { isLoading } = useLoading();

  /**
   * دریافت لیست سفارش‌ها برای جدول مدیریت با فیلتر، جستجو و صفحه‌بندی
   */
  async function getOrdersList(params: OrderQueryParams = {}): Promise<PaginatedResponse<AdminOrderListItem>> {
    try {
      const response = await $fetch<any>('/api/orders/list', {
        method: 'GET',
        query: {
          page: params.page || 1,
          limit: params.limit || 15,
          search: params.search || undefined,
          status: params.status || undefined,
          userId: params.userId || undefined,
          dateFrom: params.dateFrom || undefined,
          dateTo: params.dateTo || undefined,
        },
      });

      const data = response?.data ?? response;
      const items = data?.items ?? data?.orders ?? [];
      const total = data?.total ?? data?.meta?.total ?? items.length;
      const page = data?.page ?? data?.meta?.page ?? params.page ?? 1;
      const limit = data?.limit ?? data?.meta?.limit ?? params.limit ?? 15;
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
        detail: error?.data?.message || error?.statusMessage || 'خطا در بارگذاری سفارشات',
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
   * دریافت جزئیات کامل یک سفارش
   */
  async function getOrderById(id: number | string): Promise<Order | null> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>(`/api/orders/${id}`, {
        method: 'GET',
      });
      return (response?.data ?? response) as Order;
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        detail: error?.data?.message || error?.statusMessage || 'خطا در واکشی اطلاعات سفارش',
        life: 4000,
      });
      return null;
    } finally {
      isLoading.value = false;
    }
  }

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
   * حذف سفارش
   */
  async function deleteOrder(id: number | string): Promise<boolean> {
    isLoading.value = true;
    try {
      const response = await $fetch<any>(`/api/orders/${id}`, {
        method: 'DELETE',
      });

      toast.add({
        severity: 'success',
        summary: 'موفقیت',
        detail: response?.message || 'سفارش با موفقیت حذف شد',
        life: 3000,
      });

      return true;
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'خطا',
        detail: error?.data?.message || error?.statusMessage || 'خطا در حذف سفارش',
        life: 4000,
      });
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * دریافت آمار و گزارش کلی سفارش‌ها
   */
  async function getStatistics(): Promise<AdminOrderStatistics | null> {
    try {
      const response = await $fetch<any>('/api/orders/statistics');
      return response?.data ?? response;
    } catch {
      return null;
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
    getOrdersList,
    getOrderById,
    updateOrder,
    deleteOrder,
    getStatistics,
    getStatusLabel,
    getStatusBadgeClass,
  };
}
