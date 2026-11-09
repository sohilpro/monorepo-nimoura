<template>
  <aside class="rounded-2xl border border-gray-200 bg-white p-3 lg:p-4">
    <div class="mb-3 flex items-center justify-between gap-2">
      <h2 class="text-sm font-bold text-gray-800">گروه‌های تگ</h2>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-600 transition hover:bg-brand-100"
        @click="emit('create')"
      >
        <i class="pi pi-plus text-[10px]" /> گروه جدید
      </button>
    </div>

    <ul class="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
      <li v-for="(group, index) in groups" :key="group.id" class="shrink-0 lg:shrink">
        <div
          class="group flex items-center gap-1 rounded-xl border transition"
          :class="
            group.id === activeId
              ? 'border-brand-300 bg-brand-50/70'
              : 'border-gray-200 bg-white hover:border-brand-200 hover:bg-gray-50'
          "
        >
          <button
            type="button"
            class="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 text-start"
            @click="emit('select', group.id)"
          >
            <span
              class="size-2 shrink-0 rounded-full"
              :class="group.isActive ? 'bg-emerald-500' : 'bg-gray-300'"
              :title="group.isActive ? 'فعال' : 'غیرفعال'"
            />
            <span class="truncate text-sm font-medium text-gray-800">{{ group.name }}</span>
            <span class="ms-auto shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
              {{ toPersianDigits(group.tagCount ?? 0) }}
            </span>
          </button>

          <div v-if="group.id === activeId" class="hidden items-center pe-1 lg:flex">
            <button type="button" class="icon-btn" :disabled="index === 0" aria-label="انتقال به بالا" @click="emit('move', group.id, -1)">
              <i class="pi pi-arrow-up text-[10px]" />
            </button>
            <button type="button" class="icon-btn" :disabled="index === groups.length - 1" aria-label="انتقال به پایین" @click="emit('move', group.id, 1)">
              <i class="pi pi-arrow-down text-[10px]" />
            </button>
            <button type="button" class="icon-btn" aria-label="ویرایش گروه" @click="emit('edit', group)">
              <i class="pi pi-pencil text-[10px]" />
            </button>
          </div>
        </div>
      </li>
    </ul>

    <button
      v-if="activeGroup"
      type="button"
      class="mt-3 w-full rounded-lg border border-dashed border-gray-300 py-2 text-xs text-gray-600 hover:bg-gray-50 lg:hidden"
      @click="emit('edit', activeGroup)"
    >
      ویرایش گروه «{{ activeGroup.name }}»
    </button>
  </aside>
</template>

<script setup lang="ts">
import type { TagGroup } from '@nimoura/shared-types';
import { toPersianDigits } from '@nimoura/utils';

const props = defineProps<{ groups: TagGroup[]; activeId: number | null }>();
const emit = defineEmits<{
  select: [id: number];
  create: [];
  edit: [group: TagGroup];
  move: [id: number, direction: -1 | 1];
}>();

const activeGroup = computed(() => props.groups.find((g) => g.id === props.activeId) ?? null);
</script>

<style scoped>
.icon-btn {
  display: inline-flex;
  width: 1.75rem;
  height: 1.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  color: rgb(107 114 128);
}
.icon-btn:hover:not(:disabled) {
  background: white;
  color: rgb(17 24 39);
}
.icon-btn:disabled {
  opacity: 0.3;
}
</style>
