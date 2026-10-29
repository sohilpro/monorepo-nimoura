<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'سفارشات', href: '' },
      ]"
      title="سفارشات"
      subtitle="لیست تمام سفارشات"
    />

    <UtilsTableDynamic
      :data="orders?.data?.items || []"
      :columns="columns"
      :total="orders?.data?.meta.total"
      :page="page"
      :limit="limit"
      :serverSide="true"
      :onPageChange="onPageChange"
      :onSearch="onSearch"
      :onSort="onSort"
      :sortKey="sort"
      :sortOrder="sortOrder"
      :searchQuery="search"
      url-edit="order"
      api-delete-base="/api/orders/remove"
      :on-refresh="refresh"
      itemNameKey="orderCode"
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

  return `/api/orders/list?page=${q.page}&limit=${q.limit}&search=${q.search}&sort=${q.sort}&sortOrder=${q.sortOrder}`;
});

const { data: orders, refresh } = await useFetch(fetchUrl);

const columns = [
  {
    key: "orderCode",
    label: "کد سفارش",
  },
  {
    key: "status",
    label: "وضعیت",
    formatter: (val) => {
      switch (val) {
        case "pending":
          return "در حال پردازش ⏳";
        case "paid":
          return "پرداخت شده ✅";
        case "shipped":
          return "ارسال شده 📦";
        case "delivered":
          return "تحویل شده 🏠";
        case "cancelled":
          return "لغو شده ❌";
        default:
          return "نامشخص";
      }
    },
  },
  {
    key: "paymentRefId",
    label: "کد پرداختی",
    formatter: (val) => val ?? "-",
  },
  {
    key: "shippingCost",
    label: "هزینه ارسال",
    formatter: (val) => numberFormat(val) + " تومان",
  },

  {
    key: "subtotal",
    label: "قیمت پایه",
    formatter: (val) => numberFormat(val) + " تومان",
  },
  {
    key: "finalTotal",
    label: "قیمت نهایی",
    formatter: (val) => numberFormat(val) + " تومان",
  },
  {
    key: "createdAt",
    label: "تاریخ ثبت",
    formatter: (val) => new Date(val).toLocaleDateString("fa-IR"),
  },
  {
    key: "createdAt",
    label: "ساعت ثبت",
    formatter: (val) => new Date(val).toLocaleTimeString("fa-IR"),
  },
];
</script>
