<template>
  <div v-if="paginatedData.length" class="p-4">
    <!-- Search, Pagination & View Toggle -->
    <div
      class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4"
    >
      <input
        v-model="searchLocal"
        type="text"
        placeholder="جستجو..."
        class="md:w-1/3 dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
      />

      <div class="flex gap-2 justify-end">
        <slot />
        <NuxtLink
          :to="`/${urlEdit}/create`"
          class="bg-blue-500 text-white flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-500/90"
        >
          ایجاد +
        </NuxtLink>
        <button @click="view = 'table'" :class="viewBtnClass('table')">
          📊 جدول
        </button>
        <button @click="view = 'card'" :class="viewBtnClass('card')">
          🖼 کارت
        </button>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div
      v-if="selectedItems.length"
      class="mb-4 flex items-center justify-between bg-gray-100 p-2 rounded-xl"
    >
      <span>{{ selectedItemIds.length }} مورد انتخاب شده</span>
      <div class="flex gap-2">
        <button
          @click="deleteItem(selectedItemIds[0])"
          class="px-3 py-1 bg-red-500 text-white rounded-xl"
        >
          🗑 حذف
        </button>

        <NuxtLink
          v-if="selectedItemIds.length <= 1"
          :to="`/${urlEdit}/${selectedItemIds[0].id}`"
          class="px-3 py-1 bg-blue-500 text-white rounded-xl"
        >
          ✏️ ویرایش
        </NuxtLink>
      </div>
    </div>

    <UtilsBaseConfirmModal
      :visible="showDeleteModal"
      title="حذف آیتم"
      :message="
        selectedItemIds.length <= 1
          ? `آیا از حذف «${itemToDelete?.[itemNameKey] ?? ''}» اطمینان دارید؟`
          : `آیا از حذف چندین آیتم مطمعن هستید؟`
      "
      confirm-label="حذف"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />

    <!-- Dynamic View -->
    <component
      :is="viewComponent"
      :data="paginatedData"
      :columns="columns"
      :selectedItems="selectedItems"
      :urlEdit
      @toggleSelect="toggleSelect"
      @toggleSelectAll="toggleSelectAll"
      :sortKey="props.sortKey"
      :sortOrder="props.sortOrder"
      @sort="handleSort"
      @deleteItem="deleteItem"
    />

    <!-- Pagination -->
    <div class="flex justify-center mt-6">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-1 border rounded-r-xl"
      >
        قبلی
      </button>
      <span class="px-4 py-1 border-t border-b">صفحه {{ currentPage }}</span>
      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage >= pageCount"
        class="px-3 py-1 border rounded-l-xl"
      >
        بعدی
      </button>
    </div>
  </div>

  <UtilsEmptyItem v-else />
</template>

<script setup>
import TableView from "../common/TableView.vue";
import CardView from "../common/CardView.vue";
const toast = useToast();

const props = defineProps({
  data: Array,
  columns: Array,
  pageSize: Number,
  urlEdit: String,
  apiDeleteBase: String, // مثال: "/api/category" یا "/api/product"
  itemNameKey: {
    type: String,
    default: "title", // یا "name"
  },
  onRefresh: Function,

  total: {
    type: Number,
    default: 0,
  },
  page: {
    type: Number,
    default: 1,
  },
  limit: {
    type: Number,
    default: 10,
  },
  searchQuery: String,
  sortKey: String,
  sortOrder: {
    type: String,
    default: "asc",
  },
  serverSide: {
    type: Boolean,
    default: false,
  },
  onPageChange: Function,
  onSearch: Function,
  onSort: Function,
});

const searchQuery = ref("");
const view = ref("table");
const currentPage = ref(props.page || 1);
const selectedItems = ref([]);
const sortKey = ref("");
const sortOrder = ref("asc");
const { isLoading } = useLoading();

const showDeleteModal = ref(false);

const itemToDelete = ref(null);

const deleteItem = (item) => {
  itemToDelete.value = item;
  showDeleteModal.value = true;
  document.documentElement.classList.add("overflow-hidden");
};

// Search & Filter
const filteredData = computed(() => {
  if (!searchQuery.value) return props.data;
  return props.data.filter((item) => {
    return Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchQuery.value.toLowerCase()),
    );
  });
});
const searchLocal = ref(props.searchQuery || "");

watch(
  () => props.searchQuery,
  (val) => {
    searchLocal.value = val || "";
  },
);

// function handleSearchInput() {
//   if (props.serverSide && props.onSearch) {
//     props.onSearch(searchLocal.value);

//     props?.onRefresh()
//   } else {
//     currentPage.value = 1;
//   }
// }

const debouncedSearch = useDebounce(searchLocal, 500);

watch(debouncedSearch, (val) => {
  if (props.serverSide && props.onSearch) {
    props.onSearch(val);
    props?.onRefresh?.();
  } else {
    currentPage.value = 1;
  }
});

// Sort
const sortedData = computed(() => {
  if (!sortKey.value) return filteredData.value;
  return [...filteredData.value].sort((a, b) => {
    const aVal = a[sortKey.value];
    const bVal = b[sortKey.value];
    if (typeof aVal === "number")
      return sortOrder.value === "asc" ? aVal - bVal : bVal - aVal;
    return sortOrder.value === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });
});

// Pagination
const pageCount = computed(() => {
  return props.serverSide
    ? Math.ceil(props.total / props.limit)
    : Math.ceil(sortedData.value.length / props.pageSize);
});
const paginatedData = computed(() => {
  if (props.serverSide) return props.data;

  const pageSize = Number(props.pageSize) || 10;
  const start = (currentPage.value - 1) * pageSize;
  return sortedData.value.slice(start, start + pageSize);
});

const changePage = (newPage) => {
  const safePage = Math.max(1, Math.min(newPage, pageCount.value));
  currentPage.value = safePage;

  if (props.serverSide) {
    props.onPageChange?.(safePage);
    props.onRefresh?.();
  }
};
watch(
  () => props.page,
  (newVal) => {
    if (typeof newVal === "number") {
      currentPage.value = newVal;
    }
  },
);

watch(searchQuery, () => {
  currentPage.value = 1;
});

const handleSort = (key) => {
  if (props.serverSide && props.onSort) {
    const newOrder =
      props.sortKey === key && props.sortOrder === "asc" ? "desc" : "asc";

    props.onSort({ key, order: newOrder });
  } else {
    if (sortKey.value === key) {
      sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
    } else {
      sortKey.value = key;
      sortOrder.value = "asc";
    }
  }
};

// Select Logic
const toggleSelect = (item) => {
  const exists = selectedItems.value.find((i) => i.id === item.id);

  if (exists) {
    selectedItems.value = selectedItems.value.filter((i) => i.id !== item.id);
  } else {
    selectedItems.value.push(item);
  }
};

const toggleSelectAll = (items) => {
  const allSelected = items.every((i) =>
    selectedItems.value.find((s) => s.id === i.id),
  );
  selectedItems.value = allSelected ? [] : [...items];
};

const deleteSelected = () => {
  alert(`درخواست حذف ${selectedItems.value.length} مورد.`);
};

const confirmDelete = async () => {
  isLoading.value = true;
  try {
    await $fetch(`${props.apiDeleteBase}/${itemToDelete.value.id}`, {
      method: "DELETE",
      query: { id: itemToDelete.value.id },
    });

    toast.add({
      severity: "success",
      summary: "موفقیت",
      detail: "با موفقیت حذف شد",
      life: 3000, // مدت زمان نمایش به میلی‌ثانیه
    });

    if (props.onRefresh) props.onRefresh();

    showDeleteModal.value = false;
    itemToDelete.value = null;
    selectedItems.value = [];
    document.documentElement.classList.remove("overflow-hidden");
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "خطا",
      detail: "خطا در حذف آیتم",
    });
  } finally {
    isLoading.value = false;
  }
};

const selectedItemIds = computed(() =>
  selectedItems.value.length <= 1
    ? selectedItems.value
    : selectedItems.value.map((i) => i.id),
);

const viewComponent = computed(() =>
  view.value === "card" ? CardView : TableView,
);
const viewBtnClass = (val) =>
  `rounded-xl px-3 py-2 border ${
    val === view.value ? "bg-gray-800 text-white" : "bg-white text-gray-700"
  }`;
</script>
