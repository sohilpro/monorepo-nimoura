<template>
  <div class="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
    <article
      v-for="user in users"
      :key="user.id"
      class="flex flex-col justify-between rounded-2xl border p-4 transition-all hover:border-brand-200 hover:shadow-sm"
      :class="selectedIds.includes(user.id) ? 'border-brand-400 bg-brand-50/40' : 'border-gray-200 bg-white'"
    >
      <div>
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-3 min-w-0">
            <input
              type="checkbox"
              class="size-4 shrink-0 cursor-pointer rounded border-gray-300 accent-brand-500"
              :aria-label="`انتخاب ${getDisplayName(user)}`"
              :checked="selectedIds.includes(user.id)"
              @change="emit('toggle-select', user.id)"
            />
            <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
              {{ getInitials(user) }}
            </span>
            <div class="min-w-0">
              <NuxtLink
                :to="`/customers/${user.id}`"
                class="block truncate text-sm font-bold text-gray-800 hover:text-brand-600"
              >
                {{ getDisplayName(user) }}
              </NuxtLink>
              <span class="text-[11px] tabular-nums text-gray-400">
                #{{ toPersianDigits(user.id) }} · عضویت {{ formatDate(user.createdAt) || '—' }}
              </span>
            </div>
          </div>

          <span
            class="shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
            :class="getRoleBadgeClass(user.role)"
          >
            {{ getRoleLabel(user.role) }}
          </span>
        </div>

        <dl class="mt-4 space-y-2 border-t border-gray-100 pt-3 text-xs">
          <div class="flex items-center justify-between gap-2">
            <dt class="text-gray-500">موبایل</dt>
            <dd class="flex items-center gap-1.5 font-medium tabular-nums text-gray-800" dir="ltr">
              <i
                class="pi text-xs"
                :class="user.verify_mobile ? 'pi-check-circle text-success-600' : 'pi-clock text-warning-500'"
              />
              {{ user.mobile || '—' }}
            </dd>
          </div>
          <div class="flex items-center justify-between gap-2">
            <dt class="text-gray-500">ایمیل</dt>
            <dd class="flex items-center gap-1.5 truncate text-gray-700" dir="ltr">
              <i
                v-if="user.email"
                class="pi text-xs"
                :class="user.verify_email ? 'pi-check-circle text-success-600' : 'pi-info-circle text-gray-400'"
              />
              {{ user.email || '—' }}
            </dd>
          </div>
          <div class="flex items-center justify-between gap-2">
            <dt class="text-gray-500">کد ملی</dt>
            <dd class="tabular-nums text-gray-700" dir="ltr">{{ user.identity_card || '—' }}</dd>
          </div>
        </dl>
      </div>

      <div class="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <div class="flex gap-1.5 text-[11px] text-gray-500">
          <span class="rounded-md bg-gray-100 px-2 py-0.5 tabular-nums">
            {{ toPersianDigits(user.ordersCount ?? 0) }} سفارش
          </span>
          <span class="rounded-md bg-gray-100 px-2 py-0.5 tabular-nums">
            {{ toPersianDigits(user.addressesCount ?? 0) }} آدرس
          </span>
        </div>

        <div class="flex items-center gap-1">
          <button
            type="button"
            class="rounded-lg p-1.5 text-gray-500 transition hover:bg-brand-50 hover:text-brand-600"
            title="ویرایش سریع"
            @click="emit('quick-edit', user.id)"
          >
            <i class="pi pi-bolt text-xs" />
          </button>
          <NuxtLink
            :to="`/customers/${user.id}`"
            class="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            title="ویرایش کامل"
          >
            <i class="pi pi-pencil text-xs" />
          </NuxtLink>
          <button
            type="button"
            class="rounded-lg p-1.5 text-gray-500 transition hover:bg-error-50 hover:text-error-600"
            title="حذف"
            @click="emit('delete', user)"
          >
            <i class="pi pi-trash text-xs" />
          </button>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { AdminUserListItem } from '@nimoura/shared-types';
import { formatDate, toPersianDigits } from '@nimoura/utils';

defineProps<{
  users: AdminUserListItem[];
  selectedIds: number[];
}>();

const emit = defineEmits<{
  'toggle-select': [id: number];
  'quick-edit': [id: number];
  delete: [user: AdminUserListItem];
}>();

const { getDisplayName, getInitials, getRoleLabel, getRoleBadgeClass } =
  useAdminUsers();
</script>
