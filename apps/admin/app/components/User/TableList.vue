<template>
  <div class="overflow-x-auto">
    <table class="w-full min-w-[820px] table-auto text-start">
      <thead class="border-b border-gray-200 bg-brand-50/60 text-xs font-semibold text-gray-600">
        <tr>
          <th class="w-11 px-4 py-3.5 text-start">
            <input
              type="checkbox"
              class="size-4 cursor-pointer rounded border-gray-300 accent-brand-500"
              aria-label="انتخاب همه"
              :checked="allSelected"
              @change="emit('toggle-all')"
            />
          </th>
          <th class="px-3 py-3.5 text-start">
            <button type="button" class="inline-flex items-center gap-1 hover:text-brand-700" @click="emit('sort', 'first_name')">
              کاربر
              <i v-if="sortBy === 'first_name'" class="pi text-[10px]" :class="sortIcon" />
            </button>
          </th>
          <th class="px-3 py-3.5 text-start">
            <button type="button" class="inline-flex items-center gap-1 hover:text-brand-700" @click="emit('sort', 'mobile')">
              موبایل
              <i v-if="sortBy === 'mobile'" class="pi text-[10px]" :class="sortIcon" />
            </button>
          </th>
          <th class="px-3 py-3.5 text-start">ایمیل</th>
          <th class="px-3 py-3.5 text-start">کد ملی</th>
          <th class="px-3 py-3.5 text-start">
            <button type="button" class="inline-flex items-center gap-1 hover:text-brand-700" @click="emit('sort', 'role')">
              نقش
              <i v-if="sortBy === 'role'" class="pi text-[10px]" :class="sortIcon" />
            </button>
          </th>
          <th class="px-3 py-3.5 text-start">فعالیت</th>
          <th class="px-3 py-3.5 text-start">
            <button type="button" class="inline-flex items-center gap-1 hover:text-brand-700" @click="emit('sort', 'createdAt')">
              عضویت
              <i v-if="sortBy === 'createdAt'" class="pi text-[10px]" :class="sortIcon" />
            </button>
          </th>
          <th class="px-4 py-3.5 text-end">عملیات</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-100 text-sm">
        <tr
          v-for="user in users"
          :key="user.id"
          class="transition-colors hover:bg-brand-50/30"
          :class="{ 'bg-brand-50/50': selectedIds.includes(user.id) }"
        >
          <td class="px-4 py-3.5">
            <input
              type="checkbox"
              class="size-4 cursor-pointer rounded border-gray-300 accent-brand-500"
              :aria-label="`انتخاب ${getDisplayName(user)}`"
              :checked="selectedIds.includes(user.id)"
              @change="emit('toggle-select', user.id)"
            />
          </td>

          <td class="px-3 py-3.5">
            <div class="flex items-center gap-3">
              <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                {{ getInitials(user) }}
              </span>
              <div class="min-w-0">
                <NuxtLink
                  :to="`/customers/${user.id}`"
                  class="block truncate font-semibold text-gray-800 transition-colors hover:text-brand-600"
                >
                  {{ getDisplayName(user) }}
                </NuxtLink>
                <span class="text-[11px] tabular-nums text-gray-400">
                  شناسه #{{ toPersianDigits(user.id) }}
                </span>
              </div>
            </div>
          </td>

          <td class="px-3 py-3.5">
            <div class="flex items-center gap-1.5">
              <span class="font-medium tabular-nums text-gray-800" dir="ltr">
                {{ user.mobile || '—' }}
              </span>
              <i
                class="pi text-xs"
                :class="user.verify_mobile ? 'pi-check-circle text-success-600' : 'pi-clock text-warning-500'"
                :title="user.verify_mobile ? 'موبایل تأییدشده' : 'موبایل تأییدنشده'"
              />
            </div>
          </td>

          <td class="px-3 py-3.5">
            <div v-if="user.email" class="flex items-center gap-1.5">
              <span class="max-w-[180px] truncate text-xs text-gray-600" dir="ltr">
                {{ user.email }}
              </span>
              <i
                class="pi text-xs"
                :class="user.verify_email ? 'pi-check-circle text-success-600' : 'pi-info-circle text-gray-400'"
                :title="user.verify_email ? 'ایمیل تأییدشده' : 'ایمیل تأییدنشده'"
              />
            </div>
            <span v-else class="text-xs text-gray-400">—</span>
          </td>

          <td class="px-3 py-3.5 text-xs tabular-nums text-gray-600" dir="ltr">
            {{ user.identity_card || '—' }}
          </td>

          <td class="px-3 py-3.5">
            <span
              class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
              :class="getRoleBadgeClass(user.role)"
            >
              {{ getRoleLabel(user.role) }}
            </span>
          </td>

          <td class="px-3 py-3.5">
            <div class="flex items-center gap-1.5 text-[11px] text-gray-500">
              <span class="rounded-md bg-gray-100 px-2 py-0.5 tabular-nums">
                {{ toPersianDigits(user.ordersCount ?? 0) }} سفارش
              </span>
              <span class="rounded-md bg-gray-100 px-2 py-0.5 tabular-nums">
                {{ toPersianDigits(user.addressesCount ?? 0) }} آدرس
              </span>
            </div>
          </td>

          <td class="px-3 py-3.5 text-xs tabular-nums text-gray-500">
            {{ formatDate(user.createdAt) || '—' }}
          </td>

          <td class="px-4 py-3.5">
            <div class="flex items-center justify-end gap-1">
              <button
                type="button"
                class="rounded-lg p-2 text-gray-500 transition hover:bg-brand-50 hover:text-brand-600"
                title="ویرایش سریع"
                aria-label="ویرایش سریع"
                @click="emit('quick-edit', user.id)"
              >
                <i class="pi pi-bolt text-xs" />
              </button>
              <NuxtLink
                :to="`/customers/${user.id}`"
                class="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                title="صفحه کامل و آدرس‌ها"
                aria-label="صفحه کامل و آدرس‌ها"
              >
                <i class="pi pi-pencil text-xs" />
              </NuxtLink>
              <button
                type="button"
                class="rounded-lg p-2 text-gray-500 transition hover:bg-error-50 hover:text-error-600"
                title="حذف کاربر"
                aria-label="حذف کاربر"
                @click="emit('delete', user)"
              >
                <i class="pi pi-trash text-xs" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { AdminUserListItem } from '@nimoura/shared-types';
import { formatDate, toPersianDigits } from '@nimoura/utils';

const props = defineProps<{
  users: AdminUserListItem[];
  selectedIds: number[];
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}>();

const emit = defineEmits<{
  'toggle-select': [id: number];
  'toggle-all': [];
  sort: [field: string];
  'quick-edit': [id: number];
  delete: [user: AdminUserListItem];
}>();

const { getDisplayName, getInitials, getRoleLabel, getRoleBadgeClass } =
  useAdminUsers();

const allSelected = computed(
  () =>
    props.users.length > 0 &&
    props.users.every((u) => props.selectedIds.includes(u.id)),
);

const sortIcon = computed(() =>
  props.sortOrder === 'ASC' ? 'pi-sort-amount-up' : 'pi-sort-amount-down',
);
</script>
