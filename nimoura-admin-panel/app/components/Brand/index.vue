<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'برند ها', href: '' },
      ]"
      title="برند ها"
      subtitle="لیست تمام برند ها"
    />
    <UtilsTableDynamic
      :data="brands?.data?.brands || []"
      :columns="columns"
      :total="brands?.data?.total"
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
      api-delete-base="/api/product/brand"
      :on-refresh="refresh"
      itemNameKey="name"
    />
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

  return `/api/product/brand/list?page=${q.page}&limit=${q.limit}&search=${q.search}&sort=${q.sort}&sortOrder=${q.sortOrder}`;
});

const { data: brands, refresh } = await useFetch(fetchUrl);

const columns = [
  {
    key: "name",
    label: "برند ها",
  },
  {
    key: "subBrands",
    label: "زیر برند",
    formatter: (val) =>
      val
        ?.map((i) => i.name)
        .slice(0, 3)
        .join("/") ?? "-",
  },
  {
    key: "slug",
    label: "اسلاگ",
  },
  {
    key: "createdAt",
    label: "تاریخ ثبت",
    formatter: (val) => new Date(val).toLocaleDateString("fa-IR"),
  },
];
</script>
