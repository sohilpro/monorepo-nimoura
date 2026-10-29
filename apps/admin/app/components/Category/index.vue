<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'دسته بندی', href: '' },
      ]"
      title="دسته بندی ها"
      subtitle="لیست تمام دسته بندی ها"
    />

    <UtilsTableDynamic
      :data="categories?.data?.categories || []"
      :columns="columns"
      :total="categories?.data?.total"
      :page="page"
      :limit="limit"
      :serverSide="true"
      :onPageChange="onPageChange"
      :onSearch="onSearch"
      :onSort="onSort"
      :sortKey="sortBy"
      :sortOrder="sortOrder"
      :searchQuery="search"
      url-edit="category"
      api-delete-base="/api/category/remove"
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
  sortBy,
  sortOrder,
  queryParams,
  onPageChange,
  onSearch,
  onSort,
} = useTableQuery({ defaultSortBy: "created_at" });

const fetchUrl = computed(() => {
  const q = queryParams.value;

  return `/api/category/list?page=${q.page}&limit=${q.limit}&search=${q.search}&sortBy=${q.sortBy}&sortOrder=${q.sortOrder}`;
});

const { data: categories, refresh } = await useFetch(fetchUrl);

const columns = [
  {
    key: "name",
    label: "دسته بندی",
  },
  {
    key: "children",
    label: "زیر دسته",
    formatter: (val) =>
      val
        ?.map((i) => i.name)
        .slice(0, 3)
        .join("/") ?? "-",
  },
  {
    key: "parent",
    label: "والد",
    formatter: (val) => val?.name ?? "-",
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
