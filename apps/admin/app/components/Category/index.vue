<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'دسته‌بندی‌ها', href: '/category' },
      ]"
      title="دسته‌بندی‌ها"
      subtitle="مدیریت و مشاهده تمام دسته‌بندی‌های محصولات در فروشگاه نیمورا"
    />

    <UtilsTableDynamic
      :data="categoriesList"
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
      url-edit="category"
      api-delete-base="/api/category"
      :on-refresh="refresh"
      itemNameKey="name"
    />
  </section>
</template>

<script setup lang="ts">
import { formatDate } from '@nimoura/utils';

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

const { data: rawCategories, refresh } = await useFetch('/api/category/list', {
  query: queryParams,
  key: 'admin-categories-list',
});

const categoriesList = computed(() => {
  const d = (rawCategories.value as any)?.data ?? rawCategories.value;
  return d?.items ?? d?.categories ?? [];
});

const totalCount = computed(() => {
  const d = (rawCategories.value as any)?.data ?? rawCategories.value;
  return d?.total ?? d?.meta?.total ?? categoriesList.value.length;
});

const columns = [
  {
    key: 'name',
    label: 'نام دسته‌بندی',
    formatter: (val: string) => val || '—',
  },
  {
    key: 'parent',
    label: 'دسته‌بندی والد',
    formatter: (val: any) => val?.name ?? 'شاخه اصلی (بدون والد)',
  },
  {
    key: 'children',
    label: 'زیرمجموعه‌ها',
    formatter: (val: any[]) => {
      if (!val || !val.length) return '—';
      const names = val.slice(0, 3).map((c) => c.name).join('، ');
      return val.length > 3 ? `${names} (+${val.length - 3})` : names;
    },
  },
  {
    key: 'slug',
    label: 'اسلاگ آدرس',
    formatter: (val: string) => val || '—',
  },
  {
    key: 'createdAt',
    label: 'تاریخ ایجاد',
    formatter: (val: string) => formatDate(val) || '—',
  },
];
</script>
