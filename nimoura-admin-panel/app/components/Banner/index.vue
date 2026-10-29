<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'بنر ها', href: '' },
      ]"
      title="بنر ها"
      subtitle="لیست تمام بنر ها"
    />

    <UtilsTableDynamic
      :data="banners?.data?.banners || []"
      :columns="columns"
      :total="banners?.data?.total"
      :page="page"
      :limit="limit"
      :serverSide="true"
      :onPageChange="onPageChange"
      :onSearch="onSearch"
      :onSort="onSort"
      :sortKey="sortBy"
      :sortOrder="sortOrder"
      :searchQuery="search"
      url-edit="banners"
      api-delete-base="/api/banner/remove"
      :on-refresh="refresh"
      itemNameKey="title"
    />
  </section>
</template>

<script setup>
const {
  page,
  limit,
  search,
  sortBy,
  sortOrder,
  queryParams,
  onPageChange,
  onSearch,
  onSort,
} = useTableQuery({ defaultSortBy: "created_at" });

const fetchUrl = computed(() => {
  const q = queryParams.value;

  return `/api/banner/list?page=${q.page}&limit=${q.limit}&search=${q.search}&sortBy=${q.sortBy}&sortOrder=${q.sortOrder}`;
});

const { data: banners, refresh } = await useFetch(fetchUrl);

const columns = [
  {
    key: "title",
    label: "عنوان",
  },
  {
    key: "position",
    label: "موقعیت",
  },
  {
    key: "slug",
    label: "اسلاگ",
  },
  {
    key: "isActive",
    label: "وضعیت",
    formatter: (val) => (val ? "فعال ✅" : "غیرفعال ❌"),
  },
  {
    key: "categoryId",
    label: "بخش",
    formatter: (val) => (val ? "دسته بندی" : "برند"),
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
