import {
  OrderStatus,
  PaymentMethod,
  type DashboardRange,
  type DashboardResponse,
} from '@nimoura/shared-types';
import { formatPrice, numberFormat, toPersianDigits } from '@nimoura/utils';

const unwrap = <T>(response: any): T =>
  (response?.data !== undefined ? response.data : response) as T;

export const DASHBOARD_RANGE_OPTIONS: Array<{
  value: DashboardRange;
  label: string;
}> = [
  { value: 'today', label: 'امروز' },
  { value: '7d', label: '۷ روز گذشته' },
  { value: '30d', label: '۳۰ روز گذشته' },
  { value: '90d', label: '۹۰ روز گذشته' },
  { value: 'all', label: 'کل تاریخچه' },
];

export function formatCompactToman(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    const billions = (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '');
    return `${toPersianDigits(billions)} میلیارد`;
  }
  if (abs >= 1_000_000) {
    const millions = (value / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `${toPersianDigits(millions)} میلیون`;
  }
  if (abs >= 10_000) {
    const thousands = Math.round(value / 1_000);
    return `${numberFormat(thousands)} هزار`;
  }
  return numberFormat(value) || '۰';
}

export function formatBucketLabel(
  isoDate: string,
  range: DashboardRange,
): { short: string; full: string } {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return { short: '—', full: '—' };

  if (range === 'today') {
    const hour = new Intl.DateTimeFormat('fa-IR', {
      timeZone: 'Asia/Tehran',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
    return { short: hour, full: `ساعت ${hour}` };
  }

  const short = new Intl.DateTimeFormat('fa-IR', {
    timeZone: 'Asia/Tehran',
    month: 'numeric',
    day: 'numeric',
  }).format(date);
  const full = new Intl.DateTimeFormat('fa-IR', {
    timeZone: 'Asia/Tehran',
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  }).format(date);
  return { short, full };
}

export function paymentMethodLabel(method?: PaymentMethod | string | null): string {
  switch (method) {
    case PaymentMethod.ZARINPAL:
      return 'زرین‌پال';
    case PaymentMethod.TOROB_PAY:
      return 'ترب‌پی (اقساطی)';
    case PaymentMethod.SNAPP_PAY:
      return 'اسنپ‌پی';
    default:
      return 'نامشخص';
  }
}

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; colorVar: string; dotClass: string; icon: string }
> = {
  [OrderStatus.DELIVERED]: {
    label: 'تحویل داده شده',
    colorVar: 'var(--viz-status-delivered)',
    dotClass: 'bg-success-600',
    icon: 'pi pi-check-circle',
  },
  [OrderStatus.SHIPPED]: {
    label: 'ارسال شده',
    colorVar: 'var(--viz-status-shipped)',
    dotClass: 'bg-brand-600',
    icon: 'pi pi-truck',
  },
  [OrderStatus.PROCESSING]: {
    label: 'در حال پردازش',
    colorVar: 'var(--viz-status-processing)',
    dotClass: 'bg-blue-light-600',
    icon: 'pi pi-cog',
  },
  [OrderStatus.PENDING]: {
    label: 'در انتظار پرداخت',
    colorVar: 'var(--viz-status-pending)',
    dotClass: 'bg-orange-500',
    icon: 'pi pi-clock',
  },
  [OrderStatus.PAID]: {
    label: 'پرداخت شده',
    colorVar: 'var(--viz-status-paid)',
    dotClass: 'bg-success-500',
    icon: 'pi pi-wallet',
  },
  [OrderStatus.CANCELLED]: {
    label: 'لغو شده',
    colorVar: 'var(--viz-status-cancelled)',
    dotClass: 'bg-error-600',
    icon: 'pi pi-times-circle',
  },
};

export function useAdminDashboard() {
  const toast = useAppToast();

  const range = ref<DashboardRange>('30d');
  const dashboard = ref<DashboardResponse | null>(null);
  const initialLoading = ref(true);
  const refetching = ref(false);
  const errorMessage = ref('');

  async function load(nextRange: DashboardRange = range.value) {
    range.value = nextRange;
    errorMessage.value = '';
    if (dashboard.value) {
      refetching.value = true;
    } else {
      initialLoading.value = true;
    }

    try {
      const response = await $fetch<any>('/api/dashboard', {
        method: 'GET',
        query: { range: nextRange },
      });
      dashboard.value = unwrap<DashboardResponse>(response);
    } catch (error: any) {
      const msg =
        error?.data?.statusMessage ||
        error?.statusMessage ||
        'خطا در دریافت آمار داشبورد';
      errorMessage.value = msg;
      toast.error(msg);
    } finally {
      initialLoading.value = false;
      refetching.value = false;
    }
  }

  return {
    range,
    dashboard,
    initialLoading,
    refetching,
    errorMessage,
    load,
    formatPrice,
  };
}
