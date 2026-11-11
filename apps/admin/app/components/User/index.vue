<template>
  <section class="space-y-6">
    <ConfirmDialog />

    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <nav class="mb-1 text-sm text-gray-500">
          <ol class="flex items-center gap-1">
            <li><NuxtLink to="/" class="hover:text-gray-800">داشبورد</NuxtLink></li>
            <li class="text-gray-400">›</li>
            <li class="font-medium text-brand-600">مشتریان و کاربران</li>
          </ol>
        </nav>
        <h1 class="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          مشتریان و کاربران
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          مدیریت کامل حساب‌های کاربری، سطوح دسترسی، وضعیت تأیید تماس و نشانی‌ها
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <UtilsExcelTable :columns="columnsExcel" :rows="usersList" file-name="nimoura-customers" />
        <NuxtLink
          to="/customers/create"
          class="inline-flex h-10 items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <i class="pi pi-user-plus text-xs" />
          فرم کامل
        </NuxtLink>
        <button
          type="button"
          class="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
          @click="openCreateDialog"
        >
          <i class="pi pi-plus text-xs" />
          افزودن سریع
        </button>
      </div>
    </div>

    <UserStatsCards
      :summary="summary"
      :active-role="roleFilter"
      :active-verify="verifyFilter"
      @select="applyStatsFilter"
    />

    <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs">
      <!-- Toolbar (always visible even when search has 0 results) -->
      <div class="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="relative flex-1 lg:max-w-sm">
          <i class="pi pi-search pointer-events-none absolute top-1/2 start-3.5 -translate-y-1/2 text-sm text-gray-400" />
          <input
            v-model="searchInput"
            type="search"
            placeholder="جستجو در نام، موبایل، ایمیل، کد ملی یا شناسه..."
            class="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/60 ps-10 pe-4 text-sm text-gray-800 outline-hidden transition focus:border-brand-300 focus:bg-white focus:ring-3 focus:ring-brand-500/10"
          />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <div class="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
            <button
              v-for="tab in roleTabs"
              :key="tab.value"
              type="button"
              class="rounded-lg px-3 py-1.5 text-xs font-medium transition"
              :class="
                roleFilter === tab.value
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              "
              @click="setRoleFilter(tab.value)"
            >
              {{ tab.label }}
            </button>
          </div>

          <select
            v-model="verifyFilter"
            class="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 outline-hidden focus:border-brand-300"
            aria-label="فیلتر وضعیت تأیید"
          >
            <option value="">همه وضعیت‌های تأیید</option>
            <option value="mobile_true">موبایل تأییدشده</option>
            <option value="mobile_false">موبایل تأییدنشده</option>
            <option value="email_true">ایمیل تأییدشده</option>
          </select>

          <div class="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              class="rounded-lg px-2.5 py-1.5 text-xs transition"
              :class="viewMode === 'table' ? 'bg-white text-brand-700 shadow-xs' : 'text-gray-500 hover:text-gray-800'"
              title="نمای جدول"
              aria-label="نمای جدول"
              @click="viewMode = 'table'"
            >
              <i class="pi pi-list" />
            </button>
            <button
              type="button"
              class="rounded-lg px-2.5 py-1.5 text-xs transition"
              :class="viewMode === 'card' ? 'bg-white text-brand-700 shadow-xs' : 'text-gray-500 hover:text-gray-800'"
              title="نمای کارتی"
              aria-label="نمای کارتی"
              @click="viewMode = 'card'"
            >
              <i class="pi pi-th-large" />
            </button>
          </div>
        </div>
      </div>

      <!-- Bulk Actions Bar -->
      <div
        v-if="selectedIds.length"
        class="flex flex-wrap items-center justify-between gap-2 border-b border-brand-200 bg-brand-50/70 px-4 py-2.5"
      >
        <span class="text-xs font-semibold text-brand-800">
          {{ toPersianDigits(selectedIds.length) }} کاربر انتخاب شده
        </span>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-lg px-2.5 py-1 text-xs text-gray-600 hover:bg-white"
            @click="selectedIds = []"
          >
            لغو انتخاب
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg bg-error-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-error-700"
            @click="confirmBulkDelete"
          >
            <i class="pi pi-trash text-[11px]" />
            حذف انتخاب‌شده‌ها
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="space-y-3 p-5">
        <div v-for="n in 5" :key="n" class="h-13 animate-pulse rounded-xl bg-gray-100" />
      </div>

      <!-- Empty State -->
      <div v-else-if="!usersList.length" class="px-6 py-16 text-center">
        <span class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
          <i class="pi pi-users text-2xl" />
        </span>
        <p class="mt-4 text-sm font-semibold text-gray-800">کاربری با این مشخصات پیدا نشد</p>
        <p class="mt-1 text-xs text-gray-500">
          فیلترهای جستجو را تغییر دهید یا یک کاربر جدید اضافه کنید.
        </p>
        <div class="mt-5 flex justify-center gap-2">
          <button
            v-if="hasFilters"
            type="button"
            class="rounded-xl border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            @click="resetFilters"
          >
            پاک کردن فیلترها
          </button>
          <button
            type="button"
            class="rounded-xl bg-brand-500 px-4 py-2 text-xs font-medium text-white hover:bg-brand-600"
            @click="openCreateDialog"
          >
            افزودن کاربر جدید
          </button>
        </div>
      </div>

      <!-- List / Cards -->
      <template v-else>
        <UserTableList
          v-if="viewMode === 'table'"
          :users="usersList"
          :selected-ids="selectedIds"
          :sort-by="sortBy"
          :sort-order="sortOrder"
          @toggle-select="toggleSelect"
          @toggle-all="toggleSelectAll"
          @sort="toggleSort"
          @quick-edit="openEditDialog"
          @delete="confirmSingleDelete"
        />
        <UserCardsGrid
          v-else
          :users="usersList"
          :selected-ids="selectedIds"
          @toggle-select="toggleSelect"
          @quick-edit="openEditDialog"
          @delete="confirmSingleDelete"
        />
      </template>

      <!-- Pagination -->
      <footer
        v-if="totalCount > 0"
        class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 text-xs text-gray-500"
      >
        <span>
          نمایش {{ toPersianDigits(usersList.length) }} از {{ toPersianDigits(totalCount) }} کاربر
        </span>

        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-700 transition hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="page <= 1"
            @click="goToPage(page - 1)"
          >
            قبلی
          </button>
          <span class="px-2.5 tabular-nums text-gray-700">
            صفحه {{ toPersianDigits(page) }} از {{ toPersianDigits(totalPages) }}
          </span>
          <button
            type="button"
            class="rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-700 transition hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="page >= totalPages"
            @click="goToPage(page + 1)"
          >
            بعدی
          </button>
        </div>
      </footer>
    </div>

    <UserFormDialog
      v-model:visible="dialogVisible"
      :user-id="editingUserId"
      @saved="loadUsers"
    />
  </section>
</template>

<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import type {
  AdminUserListItem,
  AdminUsersSummary,
} from '@nimoura/shared-types';
import { UserRole } from '@nimoura/shared-types';
import { toPersianDigits } from '@nimoura/utils';
import type { StatsFilterKey } from './StatsCards.vue';

const confirm = useConfirm();
const { getUsersList, deleteUser, bulkDeleteUsers, getDisplayName } =
  useAdminUsers();

const loading = ref(true);
const usersList = ref<AdminUserListItem[]>([]);
const totalCount = ref(0);
const totalPages = ref(1);
const page = ref(1);
const limit = 10;
const searchInput = ref('');
const roleFilter = ref<UserRole | ''>('');
const verifyFilter = ref('');
const sortBy = ref('id');
const sortOrder = ref<'ASC' | 'DESC'>('DESC');
const viewMode = ref<'table' | 'card'>('table');
const selectedIds = ref<number[]>([]);

const dialogVisible = ref(false);
const editingUserId = ref<number | null>(null);

const summary = ref<AdminUsersSummary>({
  total: 0,
  users: 0,
  admins: 0,
  owners: 0,
  verifiedMobile: 0,
  verifiedEmail: 0,
});

const roleTabs: Array<{ label: string; value: UserRole | '' }> = [
  { label: 'همه', value: '' },
  { label: 'مشتری', value: UserRole.USER },
  { label: 'مدیر', value: UserRole.ADMIN },
  { label: 'مالک', value: UserRole.OWNER },
];

const hasFilters = computed(
  () => !!searchInput.value.trim() || !!roleFilter.value || !!verifyFilter.value,
);

const columnsExcel = [
  { key: 'id', label: 'شناسه' },
  { key: 'first_name', label: 'نام' },
  { key: 'last_name', label: 'نام خانوادگی' },
  { key: 'mobile', label: 'موبایل' },
  { key: 'verify_mobile', label: 'تأیید موبایل' },
  { key: 'email', label: 'ایمیل' },
  { key: 'verify_email', label: 'تأیید ایمیل' },
  { key: 'role', label: 'نقش' },
  { key: 'identity_card', label: 'کد ملی' },
  { key: 'ordersCount', label: 'تعداد سفارش' },
  { key: 'createdAt', label: 'تاریخ ثبت‌نام' },
];

async function loadUsers() {
  loading.value = true;
  try {
    const res = await getUsersList({
      page: page.value,
      limit,
      search: searchInput.value,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
      role: roleFilter.value || undefined,
      verify_mobile:
        verifyFilter.value === 'mobile_true'
          ? true
          : verifyFilter.value === 'mobile_false'
            ? false
            : undefined,
      verify_email: verifyFilter.value === 'email_true' ? true : undefined,
    });
    usersList.value = res.items;
    totalCount.value = res.total;
    totalPages.value = Math.max(1, res.totalPages);
    summary.value = res.summary;
    selectedIds.value = [];
  } finally {
    loading.value = false;
  }
}

let searchTimer: ReturnType<typeof setTimeout>;
watch(searchInput, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    page.value = 1;
    loadUsers();
  }, 350);
});

watch(verifyFilter, () => {
  page.value = 1;
  loadUsers();
});

function setRoleFilter(role: UserRole | '') {
  roleFilter.value = role;
  page.value = 1;
  loadUsers();
}

function applyStatsFilter(key: StatsFilterKey) {
  if (key === 'all') {
    roleFilter.value = '';
    verifyFilter.value = '';
  } else if (key === 'user') {
    roleFilter.value = UserRole.USER;
    verifyFilter.value = '';
  } else if (key === 'staff') {
    roleFilter.value = UserRole.ADMIN;
    verifyFilter.value = '';
  } else if (key === 'verified') {
    roleFilter.value = '';
    verifyFilter.value = 'mobile_true';
  }
  page.value = 1;
  loadUsers();
}

function resetFilters() {
  searchInput.value = '';
  roleFilter.value = '';
  verifyFilter.value = '';
  page.value = 1;
  loadUsers();
}

function toggleSort(field: string) {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'ASC' ? 'DESC' : 'ASC';
  } else {
    sortBy.value = field;
    sortOrder.value = 'ASC';
  }
  page.value = 1;
  loadUsers();
}

function goToPage(nextPage: number) {
  page.value = Math.max(1, Math.min(nextPage, totalPages.value));
  loadUsers();
}

function toggleSelect(id: number) {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((i) => i !== id)
    : [...selectedIds.value, id];
}

function toggleSelectAll() {
  const pageIds = usersList.value.map((u) => u.id);
  const all = pageIds.length > 0 && pageIds.every((id) => selectedIds.value.includes(id));
  selectedIds.value = all ? [] : pageIds;
}

function openCreateDialog() {
  editingUserId.value = null;
  dialogVisible.value = true;
}

function openEditDialog(id: number) {
  editingUserId.value = id;
  dialogVisible.value = true;
}

function confirmSingleDelete(user: AdminUserListItem) {
  confirm.require({
    header: 'حذف کاربر',
    message: `آیا از حذف «${getDisplayName(user)}» اطمینان دارید؟`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'حذف',
    rejectLabel: 'انصراف',
    acceptClass: 'p-button-danger',
    accept: async () => {
      if (await deleteUser(user.id)) await loadUsers();
    },
  });
}

function confirmBulkDelete() {
  confirm.require({
    header: 'حذف گروهی کاربران',
    message: `آیا از حذف ${toPersianDigits(selectedIds.value.length)} کاربر انتخاب‌شده اطمینان دارید؟`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'حذف همه',
    rejectLabel: 'انصراف',
    acceptClass: 'p-button-danger',
    accept: async () => {
      if (await bulkDeleteUsers(selectedIds.value)) await loadUsers();
    },
  });
}

onMounted(loadUsers);
</script>
