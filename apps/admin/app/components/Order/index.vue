<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'سفارشات', href: '/order' },
      ]"
      title="سفارشات"
      subtitle="مدیریت و پیگیری کلیه سفارش‌های مشتریان"
    />

    <!-- فیلتر تب‌های وضعیت -->
    <div class="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
      <button
        v-for="tab in statusTabs"
        :key="tab.value || 'all'"
        type="button"
        @click="selectStatus(tab.value)"
        class="px-4 py-2 text-xs font-semibold rounded-lg transition"
        :class="
          currentStatus === tab.value
            ? 'bg-brand-500 text-white shadow-xs'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
        "
      >
        {{ tab.label }}
      </button>
    </div>

    <UtilsTableDynamic
      :data="ordersList"
      :columns="columns"
      :total="totalCount"
      :page="page"
      :limit="limit"
      :serverSide="true"
      :onPageChange="onPageChange"
      :onSearch="onSearch"
      :onSort="onSort"
      :sortKey="sort"
      :sortOrder="sortOrder"
      :searchQuery="search"
      url-edit="order"
      api-delete-base="/api/orders"
      :on-refresh="refresh"
      itemNameKey="orderCode"
    >
      <UtilsExcelTable
        :columns="columnsExcel"
        :rows="ordersList"
        fileName="nimoura-orders"
      />
    </UtilsTableDynamic>
  </section>
</template>

<script setup lang="ts">
import { formatPrice, formatDate } from '@nimoura/utils';
import { OrderStatus } from '@nimoura/shared-types';

const { getStatusLabel, getStatusBadgeClass } = useAdminOrders();

const currentStatus = ref<string>('');

const statusTabs = [
  { label: 'همه سفارشات', value: '' },
  { label: 'در انتظار پرداخت', value: OrderStatus.PENDING },
  { label: 'پرداخت شده', value: OrderStatus.PAID },
  { label: 'در حال آماده‌سازی', value: OrderStatus.PROCESSING },
  { label: 'ارسال شده', value: OrderStatus.SHIPPED },
  { label: 'تحویل داده شده', value: OrderStatus.DELIVERED },
  { label: 'لغو شده', value: OrderStatus.CANCELLED },
];

const {
  page,
  limit,
  search,
  sort,
  sortOrder,
  queryParams,
  onPageChange,
  onSearch,
  onSort,
} = useTableQuery({ defaultSortBy: 'createdAt' });

const requestQuery = computed(() => ({
  ...queryParams.value,
  status: currentStatus.value || undefined,
}));

const { data: rawOrders, refresh } = await useFetch('/api/orders/list', {
  query: requestQuery,
  key: 'admin-orders-list',
});

function selectStatus(status: string) {
  currentStatus.value = status;
  page.value = 1;
}

const ordersList = computed(() => {
  const data = (rawOrders.value as any)?.data ?? rawOrders.value;
  return data?.items ?? data?.orders ?? [];
});

const totalCount = computed(() => {
  const data = (rawOrders.value as any)?.data ?? rawOrders.value;
  return data?.total ?? data?.meta?.total ?? ordersList.value.length;
});

const columns = [
  {
    key: 'orderCode',
    label: 'کد سفارش',
    formatter: (val: string) => val || '—',
  },
  {
    key: 'shippingInfo',
    label: 'گیرنده',
    formatter: (val: any) => {
      if (!val) return '—';
      const name = `${val.first_name || ''} ${val.last_name || ''}`.trim();
      return name || val.phone || '—';
    },
  },
  {
    key: 'shippingPhone',
    label: 'شماره تماس',
    formatter: (_val: any, row: any) => row.shippingInfo?.phone || '—',
  },
  {
    key: 'status',
    label: 'وضعیت',
    isCustom: true,
    formatter: (val: OrderStatus) => ({
      text: getStatusLabel(val),
      badgeClass: getStatusBadgeClass(val),
    }),
  },
  {
    key: 'finalTotal',
    label: 'مبلغ کل',
    formatter: (val: number) => formatPrice(val),
  },
  {
    key: 'shippingCost',
    label: 'هزینه ارسال',
    formatter: (val: number) => (val > 0 ? formatPrice(val) : 'رایگان'),
  },
  {
    key: 'paymentRefId',
    label: 'شماره ارجاع درگاه',
    formatter: (val: string) => val || '—',
  },
  {
    key: 'createdAt',
    label: 'تاریخ ثبت',
    formatter: (val: string) => formatDate(val) || '—',
  },
];

const columnsExcel = [
  { key: 'orderCode', label: 'کد سفارش' },
  { key: 'status', label: 'وضعیت' },
  { key: 'finalTotal', label: 'مبلغ کل (تومان)' },
  { key: 'shippingCost', label: 'هزینه ارسال' },
  { key: 'paymentRefId', label: 'کد ارجاع پرداخت' },
  { key: 'postalBarcode', label: 'بارکد پستی' },
  { key: 'createdAt', label: 'تاریخ ثبت' },
];
</script>
