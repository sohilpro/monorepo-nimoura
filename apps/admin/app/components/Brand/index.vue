<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'برندها', href: '/brand' },
      ]"
      title="برندها"
      subtitle="مدیریت برندها، لوگوها و زیربرندهای فروشگاه نیمورا"
    />

    <UtilsTableDynamic
      :data="brandsList"
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
      url-edit="brand"
      api-delete-base="/api/brand"
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

const { data: rawBrands, refresh } = await useFetch('/api/brand/list', {
  query: queryParams,
  key: 'admin-brands-list',
});

const brandsList = computed(() => {
  const d = (rawBrands.value as any)?.data ?? rawBrands.value;
  return d?.items ?? d?.brands ?? [];
});

const totalCount = computed(() => {
  const d = (rawBrands.value as any)?.data ?? rawBrands.value;
  return d?.total ?? d?.meta?.total ?? brandsList.value.length;
});

const columns = [
  {
    key: 'name',
    label: 'نام و لوگوی برند',
    isCustom: true,
    formatter: (val: string, row: any) => ({
      image: row?.logo || row?.logoUrl || '',
      text: val ?? '—',
    }),
  },
  {
    key: 'subBrands',
    label: 'زیربرندها',
    formatter: (val: any[]) => {
      if (!val || !val.length) return '—';
      const names = val.slice(0, 3).map((sb) => sb.name || sb).join('، ');
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
