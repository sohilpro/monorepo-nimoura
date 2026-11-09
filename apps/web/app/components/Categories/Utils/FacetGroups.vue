<template>
  <div class="divide-y divide-nimoura-text-100">
    <section v-for="group in groups" :key="group.id" class="py-1">
      <button
        type="button"
        class="flex w-full items-center justify-between gap-2 py-3 text-start"
        :aria-expanded="isOpen(group.id)"
        @click="toggleGroup(group.id)"
      >
        <span class="flex items-center gap-2 text-sm font-semibold text-nimoura-text-800">
          {{ group.name }}
          <span
            v-if="selectedIn(group)"
            class="rounded-full bg-nimoura-primary px-1.5 text-[10px] font-medium leading-5 text-white"
          >
            {{ numberFormat(selectedIn(group)) }}
          </span>
        </span>
        <i
          class="pi text-[11px] text-nimoura-text-400 transition-transform"
          :class="isOpen(group.id) ? 'pi-chevron-up' : 'pi-chevron-down'"
        />
      </button>

      <ul v-show="isOpen(group.id)" class="space-y-0.5 pb-3">
        <li v-for="tag in visibleTags(group)" :key="tag.id">
          <label
            class="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm transition-colors hover:bg-nimoura-primary/5"
          >
            <input
              type="checkbox"
              class="peer sr-only"
              :checked="selected.includes(tag.id)"
              @change="emit('toggle', tag.id)"
            />
            <span
              class="flex size-[18px] shrink-0 items-center justify-center rounded-md border border-nimoura-text-200 bg-white transition-colors peer-checked:border-nimoura-primary peer-checked:bg-nimoura-primary peer-focus-visible:ring-2 peer-focus-visible:ring-nimoura-primary/30"
            >
              <i v-if="selected.includes(tag.id)" class="pi pi-check text-[9px] text-white" />
            </span>
            <span
              v-if="tag.color"
              class="size-3 shrink-0 rounded-full border border-black/10"
              :style="{ backgroundColor: tag.color }"
            />
            <span
              class="min-w-0 flex-1 truncate"
              :class="selected.includes(tag.id) ? 'font-medium text-nimoura-text-800' : 'text-nimoura-text-600'"
            >
              {{ tag.name }}
            </span>
            <span class="shrink-0 text-[11px] tabular-nums text-nimoura-text-400">
              {{ numberFormat(tag.count) }}
            </span>
          </label>
        </li>

        <li v-if="group.tags.length > LIMIT">
          <button
            type="button"
            class="px-1.5 pt-1 text-xs font-medium text-nimoura-primary hover:underline"
            @click="toggleExpanded(group.id)"
          >
            {{ expanded.has(group.id) ? 'نمایش کمتر' : `نمایش همه (${numberFormat(group.tags.length)})` }}
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { FacetGroup } from '@nimoura/shared-types';

const props = defineProps<{ groups: FacetGroup[]; selected: number[] }>();
const emit = defineEmits<{ toggle: [tagId: number] }>();

const LIMIT = 6;
const closed = ref<Set<number>>(new Set());
const expanded = ref<Set<number>>(new Set());

const isOpen = (id: number) => !closed.value.has(id);
const selectedIn = (group: FacetGroup) => group.tags.filter((t) => props.selected.includes(t.id)).length;

// always show selected tags, even beyond the first LIMIT
const visibleTags = (group: FacetGroup) =>
  expanded.value.has(group.id)
    ? group.tags
    : group.tags.filter((t, i) => i < LIMIT || props.selected.includes(t.id));

function flip(source: Ref<Set<number>>, id: number) {
  const next = new Set(source.value);
  next.has(id) ? next.delete(id) : next.add(id);
  source.value = next;
}
const toggleGroup = (id: number) => flip(closed, id);
const toggleExpanded = (id: number) => flip(expanded, id);
</script>
