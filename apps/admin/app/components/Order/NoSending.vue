<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'سفارشات ارسال نشده', href: '' },
      ]"
      title="سفارشات ارسال نشده"
      subtitle="سفارش‌های پرداخت‌شده و در حال آماده‌سازی جهت بسته‌بندی و تحویل به پست"
    />

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
    />
  </section>
</template>

<script setup lang="ts">
import { formatPrice, formatDate } from '@nimoura/utils';
import { OrderStatus } from '@nimoura/shared-types';

const { getStatusLabel, getStatusBadgeClass } = useAdminOrders();

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
  status: OrderStatus.PAID,
}));

const { data: rawOrders, refresh } = await useFetch('/api/orders/list', {
  query: requestQuery,
  key: 'admin-orders-no-sending',
});

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
    formatter: (_val: any, row: any) => row?.shippingInfo?.phone || '—',
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
    label: 'مبلغ سفارش',
    formatter: (val: number) => formatPrice(val),
  },
  {
    key: 'shippingCost',
    label: 'هزینه ارسال',
    formatter: (val: number) => (val > 0 ? formatPrice(val) : 'رایگان'),
  },
  {
    key: 'createdAt',
    label: 'تاریخ پرداخت/ثبت',
    formatter: (val: string) => formatDate(val) || '—',
  },
];
</script>
