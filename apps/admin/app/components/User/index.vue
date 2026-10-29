<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'کاربران', href: '' },
      ]"
      title="کاربران"
      subtitle="لیست تمام کاربران"
    />
    <UtilsTableDynamic
      :data="users?.data?.users || []"
      :columns="columns"
      :total="users?.data?.total"
      :page="page"
      :limit="limit"
      :serverSide="true"
      :onPageChange="onPageChange"
      :onSearch="onSearch"
      :onSort="onSort"
      :sortKey="sortBy"
      :sortOrder="sortOrder"
      :searchQuery="search"
      url-edit="customers"
      api-delete-base="/api/user/remove"
      :on-refresh="refresh"
      itemNameKey="mobile"
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
  
  return `/api/user/list?page=${q.page}&limit=${q.limit}&search=${q.search}&sortBy=${q.sortBy}&sortOrder=${q.sortOrder}`;
});

const { data: users, refresh } = await useFetch(fetchUrl);

const columns = [
  {
    key: "mobile",
    label: "موبایل",
  },
  {
    key: "identity_card",
    label: "کدملی",
  },
  {
    key: "email",
    label: "ایمیل",
  },
  {
    key: "createdAt",
    label: "تاریخ عضویت",
    formatter: (val) => new Date(val).toLocaleDateString("fa-IR"),
  },
];
</script>
