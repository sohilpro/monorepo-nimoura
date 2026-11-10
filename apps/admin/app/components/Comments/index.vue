<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'دیدگاه کاربران', href: '' },
      ]"
      title="دیدگاه کاربران"
      subtitle="لیست تمام دیدگاه ها"
    />
    <UtilsTableDynamic
      :data="comments?.data?.comments || []"
      :columns="columns"
      :total="comments?.data?.total"
      :page="page"
      :limit="limit"
      :serverSide="true"
      :onPageChange="onPageChange"
      :onSearch="onSearch"
      :onSort="onSort"
      :sortKey="sortBy"
      :sortOrder="sortOrder"
      :searchQuery="search"
      url-edit="comments"
      api-delete-base="/api/comments/remove"
      :on-refresh="refresh"
      itemNameKey="subject"
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

  return `/api/comments/list?page=${q.page}&limit=${q.limit}&search=${q.search}&sortBy=${q.sortBy}&sortOrder=${q.sortOrder}`;
});

const { data: comments, refresh } = await useFetch(fetchUrl);

const columns = [
  {
    key: "subject",
    label: "عنوان",
  },
  {
    key: "user",
    label: "کاربر",
    formatter: (val) => val?.mobile || "—",
  },
  {
    key: "isApproved",
    label: "وضعیت",
    formatter: (val) => (val ? "تایید شده" : "تایید نشده"),
  },
  {
    key: "createdAt",
    label: "تاریخ ثبت",
    formatter: (val) => new Date(val).toLocaleDateString("fa-IR"),
  },
];
</script>
