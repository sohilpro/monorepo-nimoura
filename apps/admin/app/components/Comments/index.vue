<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'دیدگاه کاربران', href: '' },
      ]"
      title="دیدگاه کاربران"
      subtitle="مدیریت و بررسی نظرات ثبت‌شده توسط مشتریان"
    />

    <!-- Status Tabs -->
    <div class="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        type="button"
        @click="selectStatusTab(tab.value)"
        :class="[
          'px-4 py-2 text-sm font-medium rounded-xl transition',
          activeStatus === tab.value
            ? 'bg-brand-500 text-white shadow-xs'
            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

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
      api-delete-base="/api/comments"
      :on-refresh="refresh"
      itemNameKey="subject"
    />
  </section>
</template>

<script setup>
const props = defineProps({
  initialStatus: {
    type: String,
    default: "",
  },
});

const activeStatus = ref(props.initialStatus || "");

const statusTabs = [
  { label: "همه دیدگاه‌ها", value: "" },
  { label: "در انتظار بررسی", value: "pending" },
  { label: "تایید شده", value: "approved" },
  { label: "رد شده", value: "rejected" },
];

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
} = useTableQuery({ defaultSortBy: "createdAt" });

const selectStatusTab = (val) => {
  activeStatus.value = val;
  page.value = 1;
};

const fetchUrl = computed(() => {
  const q = queryParams.value;
  const params = new URLSearchParams();

  if (q.page) params.set("page", String(q.page));
  if (q.limit) params.set("limit", String(q.limit));
  if (q.search && q.search.trim()) params.set("search", q.search.trim());

  const sortVal = q.sortBy || q.sort || "createdAt";
  if (sortVal && sortVal !== "undefined") params.set("sortBy", sortVal);

  const orderVal = q.sortOrder || "DESC";
  if (orderVal && orderVal !== "undefined") params.set("sortOrder", orderVal);

  if (activeStatus.value) params.set("status", activeStatus.value);

  return `/api/comments?${params.toString()}`;
});

const { data: comments, refresh } = await useFetch(fetchUrl);

const columns = [
  {
    key: "subject",
    label: "عنوان دیدگاه",
  },
  {
    key: "product",
    label: "محصول",
    formatter: (val) => val?.title || "—",
  },
  {
    key: "user",
    label: "کاربر",
    formatter: (val) => {
      if (!val) return "—";
      const name = `${val.first_name || ""} ${val.last_name || ""}`.trim();
      return name ? `${name} (${val.mobile || "—"})` : val.mobile || "—";
    },
  },
  {
    key: "rating",
    label: "امتیاز",
    formatter: (val) => (val ? `${val} از ۵ ⭐` : "—"),
  },
  {
    key: "isApproved",
    label: "وضعیت",
    formatter: (_val, row) => {
      if (row?.isApproved) {
        return { text: "تایید شده", badgeClass: "bg-emerald-100 text-emerald-800" };
      }
      if (row?.isRejected) {
        return { text: "رد شده", badgeClass: "bg-rose-100 text-rose-800" };
      }
      return { text: "در انتظار بررسی", badgeClass: "bg-amber-100 text-amber-800" };
    },
  },
  {
    key: "createdAt",
    label: "تاریخ ثبت",
    formatter: (val) => (val ? new Date(val).toLocaleDateString("fa-IR") : "—"),
  },
];
</script>
