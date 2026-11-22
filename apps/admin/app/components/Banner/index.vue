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

const { data: rawBanners, refresh } = await useFetch('/api/banner', {
  query: queryParams,
  key: 'admin-banners-list',
});

/**
 * پاسخ لیست بنرها بسته به نسخه بکند میتواند این شکلها باشد:
 *   { items: [...] }                      (شکل فعلی API)
 *   { success, data: { items: [...] } }   (پوشش ResponseInterceptor)
 *   { data: [...], items: [...], banners: [...] }  (شکل قدیمی تکراری)
 *   [...]                                 (وقتی BFF آرایه را مستقیم برگرداند)
 * بنابراین آرایه را با جستجوی محدود پیدا میکنیم، نه با یک بار unwrapping.
 */
function extractBannerList(payload: unknown, depth = 0): any[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object' || depth > 3) return [];

  const root: any = payload;
  if (Array.isArray(root.data)) return root.data;

  for (const key of ['items', 'banners', 'data'] as const) {
    const value = root[key];
    if (Array.isArray(value)) return value;
  }
  for (const key of ['items', 'banners', 'data'] as const) {
    const nested = root[key];
    if (nested && typeof nested === 'object') {
      const found = extractBannerList(nested, depth + 1);
      if (found.length) return found;
    }
  }
  return [];
}

const bannersList = computed(() => extractBannerList(rawBanners.value));

const totalCount = computed(() => {
  const root: any = (rawBanners.value as any)?.data ?? rawBanners.value;
  if (Array.isArray(root)) return root.length;
  return root?.total ?? root?.meta?.total ?? bannersList.value.length;
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
