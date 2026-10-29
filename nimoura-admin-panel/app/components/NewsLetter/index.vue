<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'خبرنامه', href: '' },
      ]"
      title="خبرنامه"
      subtitle="لیست تمام کاربر ها"
    />

    <UtilsTableDynamic
      :data="newsletter?.data?.newsletter || []"
      :columns="columns"
      :total="newsletter?.data?.total"
      :page="page"
      :limit="limit"
      :serverSide="true"
      :onPageChange="onPageChange"
      :onSearch="onSearch"
      :onSort="onSort"
      :sortKey="sortBy"
      :sortOrder="sortOrder"
      :searchQuery="search"
      url-edit="newsletter"
      api-delete-base="/api/newsletter/remove"
      :on-refresh="refresh"
      itemNameKey="email"
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

  return `/api/newsletter/list?page=${q.page}&limit=${q.limit}&search=${q.search}&sortBy=${q.sortBy}&sortOrder=${q.sortOrder}`;
});

const { data: newsletter, refresh } = await useFetch(fetchUrl);

const columns = [
  {
    key: "email",
    label: "ایمیل",
  },

  {
    key: "isActive",
    label: "وضعیت",
    formatter: (val) => (val ? "فعال" : "غیرفعال"),
  },
  {
    key: "subscribedAt",
    label: "تاریخ عضویت",
    formatter: (val) => new Date(val).toLocaleDateString("fa-IR"),
  },
];
</script>
