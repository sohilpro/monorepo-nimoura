<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'محصولات', href: '' },
      ]"
      title="محصولات"
      subtitle="لیست تمام محصولات موجود"
    />

    <UtilsTableDynamic
      :data="products?.data?.items || []"
      :columns="columns"
      :total="products?.data?.meta.total"
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
        :rows="products?.data?.items || []"
        fileName="nimoura-products"
      />
    </UtilsTableDynamic>
  </section>
</template>

<script setup>
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
} = useTableQuery({ defaultSortBy: "createdAt" });

const fetchUrl = computed(() => {
  const q = queryParams.value;

  return `/api/product/list?page=${q.page}&limit=${q.limit}&search=${q.search}&sort=${q.sort}&sortOrder=${q.sortOrder}`;
});

const { data: products, refresh } = await useFetch(fetchUrl);

const columns = [
  {
    key: "title",
    label: "نام محصول",
    isCustom: true,
    formatter: (val, row) => ({
      image: row.thumbnail,
      text: val,
    }),
  },
  {
    key: "category",
    label: "دسته بندی",
    formatter: (val) => val?.name ?? "-",
  },
  {
    key: "brand",
    label: "برند",
    formatter: (val) => val?.name ?? "-",
  },
  {
    key: "stock",
    label: "موجودی",
    formatter: (val) => val ?? "تنوع",
  },

  {
    key: "priceDiscount",
    label: "قیمت",
    formatter: (val) => numberFormat(val) + " تومان",
  },
  {
    key: "createdAt",
    label: "تاریخ ثبت",
    formatter: (val) => new Date(val).toLocaleDateString("fa-IR"),
  },
];

const columnsExcel = [
  { key: "title", label: "محصول" },
  { key: "color", label: "رنگ" },
  { key: "price", label: "قیمت اصلی" },
  { key: "priceDiscount", label: "قیمت تخفیفی" },
  { key: "stock", label: "موجودی" },
];
</script>
