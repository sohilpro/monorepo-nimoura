<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'محصولات', href: '/product' },
      ]"
      title="محصولات"
      subtitle="مدیریت و مشاهده تمام محصولات فروشگاه نیمورا"
    />

    <UtilsTableDynamic
      :data="productList"
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
      url-edit="product"
      api-delete-base="/api/product"
      :on-refresh="refresh"
      itemNameKey="title"
    >
      <UtilsExcelTable
        :columns="columnsExcel"
        :rows="productList"
        fileName="nimoura-products"
      />
    </UtilsTableDynamic>
  </section>
</template>

<script setup lang="ts">
import { formatPrice, formatDate } from '@nimoura/utils';

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

const { data: rawData, refresh } = await useFetch('/api/product/list', {
  query: queryParams,
  key: 'admin-products-list',
});

const productList = computed(() => {
  const data = (rawData.value as any)?.data ?? rawData.value;
  return data?.items ?? data?.products ?? [];
});

const totalCount = computed(() => {
  const data = (rawData.value as any)?.data ?? rawData.value;
  return data?.total ?? data?.meta?.total ?? productList.value.length;
});

const columns = [
  {
    key: 'title',
    label: 'نام محصول',
    isCustom: true,
    formatter: (val: string, row: any) => ({
      image: row?.thumbnail || row?.images?.[0]?.url || '',
      text: val ?? '—',
    }),
  },
  {
    key: 'category',
    label: 'دسته‌بندی',
    formatter: (val: any) => val?.name ?? '—',
  },
  {
    key: 'brand',
    label: 'برند',
    formatter: (val: any) => val?.name ?? '—',
  },
  {
    key: 'stock',
    label: 'موجودی',
    formatter: (val: number | null | undefined, row: any) => {
      if (typeof val !== 'number') return '—';
      if (val <= 0) return 'اتمام موجودی';
      return row?.type === 'variant' && row?.variants?.length
        ? `${val} (${row.variants.length} تنوع)`
        : val;
    },
  },
  {
    key: 'price',
    label: 'قیمت نهایی',
    formatter: (_val: any, row: any) => {
      const price = row?.price ?? 0;
      const priceDiscount = row?.priceDiscount ?? 0;
      const finalPrice = priceDiscount > 0 ? priceDiscount : price;
      return formatPrice(finalPrice);
    },
  },
  {
    key: 'isAvailable',
    label: 'وضعیت',
    formatter: (val: boolean) => (val ? 'فعال در سایت' : 'غیرفعال'),
  },
  {
    key: 'createdAt',
    label: 'تاریخ ثبت',
    formatter: (val: string) => formatDate(val) || '—',
  },
];

const columnsExcel = [
  { key: 'title', label: 'نام محصول' },
  { key: 'englishTitle', label: 'عنوان انگلیسی' },
  { key: 'sku', label: 'کد SKU' },
  { key: 'price', label: 'قیمت اصلی' },
  { key: 'priceDiscount', label: 'قیمت تخفیف‌دار' },
  { key: 'stock', label: 'موجودی' },
  { key: 'variantLabel', label: 'تنوع' },
  { key: 'colorHex', label: 'کد رنگ' },
];
</script>
