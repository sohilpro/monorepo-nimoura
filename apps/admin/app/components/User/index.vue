<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'مشتریان', href: '/customers' },
      ]"
      title="مشتریان و کاربران"
      subtitle="مدیریت حساب‌های کاربری، سطوح دسترسی و مشتریان فروشگاه نیمورا"
    />

    <UtilsTableDynamic
      :data="usersList"
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
      url-edit="customers"
      api-delete-base="/api/user"
      :on-refresh="refresh"
      itemNameKey="mobile"
    >
      <UtilsExcelTable
        :columns="columnsExcel"
        :rows="usersList"
        fileName="nimoura-customers"
      />
    </UtilsTableDynamic>
  </section>
</template>

<script setup lang="ts">
import { formatDate } from '@nimoura/utils';
import { UserRole } from '@nimoura/shared-types';

const { getRoleLabel, getRoleBadgeClass } = useAdminUsers();

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
} = useTableQuery({ defaultSortBy: 'id' });

const { data: rawUsers, refresh } = await useFetch('/api/user/list', {
  query: queryParams,
  key: 'admin-users-list',
});

const usersList = computed(() => {
  const d = (rawUsers.value as any)?.data ?? rawUsers.value;
  return d?.items ?? d?.users ?? [];
});

const totalCount = computed(() => {
  const d = (rawUsers.value as any)?.data ?? rawUsers.value;
  return d?.total ?? d?.meta?.total ?? usersList.value.length;
});

const columns = [
  {
    key: 'fullName',
    label: 'نام و نام خانوادگی',
    formatter: (_val: any, row: any) => {
      const name = `${row?.first_name || ''} ${row?.last_name || ''}`.trim();
      return name || 'بدون نام';
    },
  },
  {
    key: 'mobile',
    label: 'شماره موبایل',
    formatter: (val: string) => val || '—',
  },
  {
    key: 'email',
    label: 'ایمیل',
    formatter: (val: string) => val || '—',
  },
  {
    key: 'role',
    label: 'سطح دسترسی',
    isCustom: true,
    formatter: (val: UserRole) => ({
      text: getRoleLabel(val),
      badgeClass: getRoleBadgeClass(val),
    }),
  },
  {
    key: 'identity_card',
    label: 'کد ملی',
    formatter: (val: string) => val || '—',
  },
  {
    key: 'createdAt',
    label: 'تاریخ عضویت',
    formatter: (val: string) => formatDate(val) || '—',
  },
];

const columnsExcel = [
  { key: 'first_name', label: 'نام' },
  { key: 'last_name', label: 'نام خانوادگی' },
  { key: 'mobile', label: 'موبایل' },
  { key: 'email', label: 'ایمیل' },
  { key: 'role', label: 'نقش' },
  { key: 'identity_card', label: 'کد ملی' },
  { key: 'createdAt', label: 'تاریخ ثبت‌نام' },
];
</script>
