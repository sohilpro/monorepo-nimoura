<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'بنرها', href: '/banners' },
      ]"
      title="بنرها و اسلایدرها"
      subtitle="مدیریت تمام بنرهای تبلیغاتی، اسلایدرها و جایگاه‌های نمایش"
    />

    <UtilsTableDynamic
      :data="bannersList"
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
      url-edit="banners"
      api-delete-base="/api/banner"
      :on-refresh="refresh"
      itemNameKey="title"
    />
  </section>
</template>

<script setup lang="ts">
import { formatDate } from '@nimoura/utils';
import { BannerStatus } from '@nimoura/shared-types';

const { getDeviceLabel, getStatusLabel, getStatusBadgeClass } = useAdminBanners();

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
} = useTableQuery({ defaultSortBy: 'sortOrder' });

const { data: rawBanners, refresh } = await useFetch('/api/banner/list', {
  query: queryParams,
  key: 'admin-banners-list',
});

const bannersList = computed(() => {
  const d = (rawBanners.value as any)?.data ?? rawBanners.value;
  return d?.items ?? d?.banners ?? d?.data ?? [];
});

const totalCount = computed(() => {
  const d = (rawBanners.value as any)?.data ?? rawBanners.value;
  return d?.total ?? d?.meta?.total ?? bannersList.value.length;
});

const columns = [
  {
    key: 'title',
    label: 'عنوان و تصویر بنر',
    isCustom: true,
    formatter: (val: string, row: any) => ({
      image: row?.imageUrl || row?.mobileImageUrl || '',
      text: val ?? '—',
    }),
  },
  {
    key: 'position',
    label: 'جایگاه نمایش',
    formatter: (val: any) => val?.name || val?.key || 'عمومی',
  },
  {
    key: 'device',
    label: 'دستگاه',
    formatter: (val: any) => getDeviceLabel(val),
  },
  {
    key: 'status',
    label: 'وضعیت',
    isCustom: true,
    formatter: (val: BannerStatus) => ({
      text: getStatusLabel(val),
      badgeClass: getStatusBadgeClass(val),
    }),
  },
  {
    key: 'link',
    label: 'لینک مقصد',
    formatter: (val: string) => val || '—',
  },
  {
    key: 'sortOrder',
    label: 'اولویت ترتیب',
    formatter: (val: number) => val ?? 0,
  },
  {
    key: 'createdAt',
    label: 'تاریخ ایجاد',
    formatter: (val: string) => formatDate(val) || '—',
  },
];
</script>
