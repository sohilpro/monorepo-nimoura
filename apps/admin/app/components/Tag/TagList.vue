<template>
  <section class="min-w-0 rounded-2xl border border-gray-200 bg-white">
    <div v-if="!group" class="px-6 py-16 text-center text-sm text-gray-500">
      یک گروه را انتخاب کنید یا گروه جدیدی بسازید.
    </div>

    <template v-else>
      <header class="space-y-4 border-b border-gray-100 p-4 sm:p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-base font-bold text-gray-900">{{ group.name }}</h2>
            <p v-if="group.description" class="mt-1 text-xs leading-5 text-gray-500">{{ group.description }}</p>
            <p v-if="!group.isFilterable" class="mt-1 text-xs text-amber-600">این گروه در فیلترهای فروشگاه نمایش داده نمی‌شود.</p>
          </div>
        </div>

        <!-- Quick add -->
        <form class="flex gap-2" @submit.prevent="submitQuickAdd">
          <input
            v-model="quickAdd"
            type="text"
            :placeholder="`افزودن تگ به «${group.name}»؛ چند تگ را با ویرگول جدا کنید`"
            class="h-11 min-w-0 flex-1 rounded-xl border border-gray-300 bg-gray-50 px-4 text-sm outline-hidden focus:border-brand-300 focus:bg-white focus:ring-3 focus:ring-brand-500/10"
          />
          <button
            type="submit"
            class="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
            :disabled="!quickAdd.trim() || adding"
          >
            <i class="pi pi-plus text-xs" /> افزودن
          </button>
        </form>

        <input
          :value="search"
          type="search"
          placeholder="جستجو در تگ‌های این گروه..."
          class="h-10 w-full rounded-xl border border-gray-200 px-4 text-sm outline-hidden focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
          @input="emit('update:search', ($event.target as HTMLInputElement).value)"
        />
      </header>

      <div v-if="loading" class="px-6 py-10 text-center text-sm text-gray-400">در حال بارگذاری...</div>
      <div v-else-if="!tags.length" class="px-6 py-12 text-center text-sm text-gray-500">
        {{ search ? 'تگی با این عبارت پیدا نشد.' : 'هنوز تگی در این گروه نیست. از کادر بالا اولین تگ را اضافه کنید.' }}
      </div>

      <ul v-else class="divide-y divide-gray-100">
        <li v-for="(tag, index) in tags" :key="tag.id" class="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-5">
          <span
            class="size-3.5 shrink-0 rounded-full border border-black/10"
            :class="tag.color ? '' : 'bg-gray-200'"
            :style="tag.color ? { backgroundColor: tag.color } : undefined"
          />
          <div class="min-w-0 flex-1 basis-40">
            <p class="truncate text-sm font-medium" :class="tag.isActive ? 'text-gray-900' : 'text-gray-400 line-through'">
              {{ tag.name }}
            </p>
            <p class="truncate text-[11px] text-gray-400" dir="ltr">{{ tag.slug }}</p>
          </div>

          <span class="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-600" :title="'تعداد محصولات دارای این تگ'">
            {{ toPersianDigits(tag.productCount ?? 0) }} محصول
          </span>

          <div class="ms-auto flex items-center gap-0.5">
            <CommonToggleSwitch
              :id="`tag-active-${tag.id}`"
              :model-value="tag.isActive"
              label=""
              @update:model-value="emit('toggle', tag, $event)"
            />
            <template v-if="!search">
              <button type="button" class="row-btn" :disabled="index === 0" aria-label="بالا" @click="emit('move', tag, -1)"><i class="pi pi-arrow-up text-[11px]" /></button>
              <button type="button" class="row-btn" :disabled="index === tags.length - 1" aria-label="پایین" @click="emit('move', tag, 1)"><i class="pi pi-arrow-down text-[11px]" /></button>
            </template>
            <button type="button" class="row-btn" aria-label="ویرایش" @click="emit('edit', tag)"><i class="pi pi-pencil text-[11px]" /></button>
            <button type="button" class="row-btn" aria-label="ادغام با تگ دیگر" title="ادغام با تگ دیگر" @click="emit('merge', tag)"><i class="pi pi-clone text-[11px]" /></button>
            <button type="button" class="row-btn hover:!bg-rose-50 hover:!text-rose-600" aria-label="حذف" @click="emit('delete', tag)"><i class="pi pi-trash text-[11px]" /></button>
          </div>
        </li>
      </ul>

      <footer v-if="tags.length" class="border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
        {{ toPersianDigits(total) }} تگ در این گروه
      </footer>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { Tag, TagGroup } from '@nimoura/shared-types';
import { toPersianDigits } from '@nimoura/utils';

defineProps<{
  group: TagGroup | null;
  tags: Tag[];
  total: number;
  loading: boolean;
  adding: boolean;
  search: string;
}>();

const emit = defineEmits<{
  'update:search': [value: string];
  add: [names: string[]];
  edit: [tag: Tag];
  toggle: [tag: Tag, active: boolean];
  move: [tag: Tag, direction: -1 | 1];
  merge: [tag: Tag];
  delete: [tag: Tag];
}>();

const quickAdd = ref('');

function submitQuickAdd() {
  const names = quickAdd.value
    .split(/[,،\n]/)
    .map((n) => n.trim())
    .filter(Boolean);
  if (!names.length) return;
  emit('add', names);
  quickAdd.value = '';
}
</script>

<style scoped>
.row-btn {
  display: inline-flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  color: rgb(107 114 128);
  transition: background-color 0.15s;
}
.row-btn:hover:not(:disabled) {
  background: rgb(243 244 246);
  color: rgb(17 24 39);
}
.row-btn:disabled {
  opacity: 0.3;
}
</style>
