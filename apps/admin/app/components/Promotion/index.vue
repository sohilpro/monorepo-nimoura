<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'تخفیفات', href: '' },
      ]"
      title="تخفیفات"
      subtitle="لیست تمام تخفیف ها"
    />

    <UtilsTableDynamic
      :data="promotions?.data?.promotions || []"
      :columns="columns"
      :total="promotions?.data?.total"
      :page="page"
      :limit="limit"
      :serverSide="true"
      :onPageChange="onPageChange"
      :onSearch="onSearch"
      :onSort="onSort"
      :sortKey="sortBy"
      :sortOrder="sortOrder"
      :searchQuery="search"
      url-edit="promotion"
      api-delete-base="/api/promotion/remove"
      :on-refresh="refresh"
      itemNameKey="promoCode"
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

  return `/api/promotion/list?page=${q.page}&limit=${q.limit}&search=${q.search}&sortBy=${q.sortBy}&sortOrder=${q.sortOrder}`;
});

const { data: promotions, refresh } = await useFetch(fetchUrl);

const columns = [
  {
    key: "title",
    label: "عنوان تخفیف",
  },
  {
    key: "promoCode",
    label: "کد تخفیف",
  },
  {
    key: "type",
    label: "نوع",
  },
  {
    key: "amount",
    label: "مقدار",
    formatter: (val) => numberFormat(val),
  },
  {
    key: "startDate",
    label: "تاریخ شروع",
    formatter: (val) => new Date(val).toLocaleDateString("fa-IR"),
  },
  {
    key: "endDate",
    label: "تاریخ پایان",
    formatter: (val) => new Date(val).toLocaleDateString("fa-IR"),
  },
  {
    key: "isActive",
    label: "وضعیت",
    formatter: (val) => (val ? "فعال" : "غیرفعال"),
  },
];
</script>
