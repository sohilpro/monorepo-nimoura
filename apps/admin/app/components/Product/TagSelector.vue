<template>
  <CommonComponentCard title="تگ‌های محصول">
    <div class="space-y-4">
      <p class="text-xs leading-6 text-gray-500">
        مشتری با همین تگ‌ها محصولات را فیلتر می‌کند. برای هر گروه، تگ‌های مناسب این محصول را انتخاب کنید.
      </p>

      <div v-if="selectedTags.length" class="flex flex-wrap gap-1.5 rounded-xl bg-brand-50/60 p-3">
        <span class="w-full text-xs font-medium text-brand-700">
          {{ toPersianDigits(selectedTags.length) }} تگ انتخاب شده
        </span>
        <button
          v-for="tag in selectedTags"
          :key="tag.id"
          type="button"
          class="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs text-gray-700 ring-1 ring-brand-200 transition hover:bg-rose-50 hover:text-rose-600 hover:ring-rose-200"
          :title="`حذف «${tag.name}»`"
          @click="toggle(tag.id)"
        >
          <span class="text-gray-400">{{ tag.groupName }}:</span>{{ tag.name }}
          <i class="pi pi-times text-[9px]" />
        </button>
      </div>

      <p v-if="loading" class="py-4 text-center text-sm text-gray-400">در حال بارگذاری تگ‌ها...</p>
      <p v-else-if="!groups.length" class="py-4 text-center text-sm text-gray-500">
        هنوز گروه تگی ساخته نشده است.
        <NuxtLink to="/tag" class="text-brand-600 underline">مدیریت تگ‌ها</NuxtLink>
      </p>

      <div v-for="group in groups" :key="group.id" class="rounded-xl border border-gray-200">
        <button
          type="button"
          class="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-start"
          :aria-expanded="isOpen(group.id)"
          @click="toggleGroup(group.id)"
        >
          <span class="flex items-center gap-2 text-sm font-semibold text-gray-800">
            {{ group.name }}
            <span
              v-if="selectedCount(group)"
              class="rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-medium text-white"
            >
              {{ toPersianDigits(selectedCount(group)) }}
            </span>
          </span>
          <i class="pi text-xs text-gray-400" :class="isOpen(group.id) ? 'pi-chevron-up' : 'pi-chevron-down'" />
        </button>

        <div v-show="isOpen(group.id)" class="space-y-3 border-t border-gray-100 p-3.5">
          <input
            v-if="(group.tags?.length ?? 0) > 12"
            v-model="filters[group.id]"
            type="search"
            placeholder="جستجو در این گروه..."
            class="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-hidden focus:border-brand-300"
          />

          <div class="flex flex-wrap gap-2">
            <button
              v-for="tag in visibleTags(group)"
              :key="tag.id"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition"
              :class="
                modelValue.includes(tag.id)
                  ? 'border-brand-500 bg-brand-500 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:bg-brand-50'
              "
              :aria-pressed="modelValue.includes(tag.id)"
              @click="toggle(tag.id)"
            >
              <span v-if="tag.color" class="size-2.5 rounded-full border border-white/60" :style="{ backgroundColor: tag.color }" />
              {{ tag.name }}
            </button>
            <p v-if="!visibleTags(group).length" class="text-xs text-gray-400">
              {{ filters[group.id] ? 'موردی پیدا نشد.' : 'این گروه هنوز تگی ندارد.' }}
            </p>
          </div>

          <form class="flex gap-2" @submit.prevent="createInGroup(group)">
            <input
              v-model="drafts[group.id]"
              type="text"
              :placeholder="`تگ جدید در «${group.name}» (با ویرگول جدا کنید)`"
              class="h-9 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-sm outline-hidden focus:border-brand-300"
            />
            <button
              type="submit"
              class="shrink-0 rounded-lg bg-gray-900 px-3 text-xs font-medium text-white transition hover:bg-gray-700 disabled:opacity-40"
              :disabled="!drafts[group.id]?.trim() || creating === group.id"
            >
              افزودن
            </button>
          </form>
        </div>
      </div>
    </div>
  </CommonComponentCard>
</template>

<script setup lang="ts">
import type { TagGroup } from '@nimoura/shared-types';
import { toPersianDigits } from '@nimoura/utils';

const modelValue = defineModel<number[]>({ required: true });

const api = useProductTags();

const groups = ref<TagGroup[]>([]);
const loading = ref(true);
const creating = ref<number | null>(null);
const drafts = reactive<Record<number, string>>({});
const filters = reactive<Record<number, string>>({});
const open = ref<Set<number>>(new Set());
let initializedOpen = false;

const selectedTags = computed(() =>
  groups.value.flatMap((g) =>
    (g.tags ?? []).filter((t) => modelValue.value.includes(t.id)).map((t) => ({ ...t, groupName: g.name })),
  ),
);

const selectedCount = (group: TagGroup) =>
  (group.tags ?? []).filter((t) => modelValue.value.includes(t.id)).length;

const visibleTags = (group: TagGroup) => {
  const q = (filters[group.id] ?? '').trim();
  const tags = group.tags ?? [];
  return q ? tags.filter((t) => t.name.includes(q)) : tags;
};

const isOpen = (id: number) => open.value.has(id);
function toggleGroup(id: number) {
  initializedOpen = true;
  const next = new Set(open.value);
  next.has(id) ? next.delete(id) : next.add(id);
  open.value = next;
}

function toggle(id: number) {
  modelValue.value = modelValue.value.includes(id)
    ? modelValue.value.filter((v) => v !== id)
    : [...modelValue.value, id];
}

function syncInitialOpen() {
  if (!groups.value.length) return;
  const selectedIds = groups.value.filter((g) => selectedCount(g) > 0).map((g) => g.id);
  if (selectedIds.length) {
    open.value = new Set(selectedIds);
    initializedOpen = true;
  } else if (!initializedOpen && groups.value[0]) {
    open.value = new Set([groups.value[0].id]);
  }
}

watch(
  () => modelValue.value,
  () => {
    if (!initializedOpen) syncInitialOpen();
  },
  { deep: true },
);

async function load() {
  loading.value = true;
  groups.value = (await api.getOptions()) ?? [];
  loading.value = false;
  syncInitialOpen();
}

async function createInGroup(group: TagGroup) {
  const names = (drafts[group.id] ?? '')
    .split(/[,،\n]/)
    .map((n) => n.trim())
    .filter(Boolean);
  if (!names.length) return;

  creating.value = group.id;
  const created = await api.addTagsBulk(group.id, names);
  creating.value = null;
  if (!created) return;

  drafts[group.id] = '';
  const fresh = (await api.getOptions()) ?? [];
  groups.value = fresh;
  // select what was just typed, so adding a new tag from the product page is one step
  const newIds = created.map((t) => t.id).filter((id) => !modelValue.value.includes(id));
  modelValue.value = [...modelValue.value, ...newIds];
}

onMounted(load);
</script>
