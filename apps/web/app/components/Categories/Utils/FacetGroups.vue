<template>
  <Accordion
    v-model:value="openGroupIds"
    multiple
    class="!border-0"
    :pt="{ root: { class: 'divide-y divide-nimoura-text-100' } }"
  >
    <AccordionPanel
      v-for="group in groups"
      :key="group.id"
      :value="String(group.id)"
      class="!border-0"
    >
      <AccordionHeader
        class="!bg-transparent !px-0 !py-3 !text-sm !font-semibold !text-nimoura-text-800 !shadow-none hover:!bg-nimoura-primary/5"
      >
        <span class="flex items-center gap-2">
          <span>{{ group.name }}</span>
          <Badge
            v-if="selectedIn(group)"
            :value="numberFormat(selectedIn(group))"
            size="small"
            class="!bg-nimoura-primary !text-white"
          />
        </span>
      </AccordionHeader>

      <AccordionContent
        :pt="{
          content: { class: '!bg-transparent !px-0 !pb-3 !pt-0' },
        }"
      >
        <ul class="space-y-0.5">
          <li v-for="tag in visibleTags(group)" :key="tag.id">
            <label
              class="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm transition-colors hover:bg-nimoura-primary/5"
            >
              <Checkbox
                :model-value="selected.includes(tag.id)"
                binary
                @update:model-value="emit('toggle', tag.id)"
              />
              <span
                v-if="tag.color"
                class="size-3 shrink-0 rounded-full border border-black/10"
                :style="{ backgroundColor: tag.color }"
              />
              <span
                class="min-w-0 flex-1 truncate"
                :class="
                  selected.includes(tag.id)
                    ? 'font-medium text-nimoura-text-800'
                    : 'text-nimoura-text-600'
                "
              >
                {{ tag.name }}
              </span>
              <span class="shrink-0 text-[11px] tabular-nums text-nimoura-text-400">
                {{ numberFormat(tag.count) }}
              </span>
            </label>
          </li>

          <li v-if="group.tags.length > LIMIT">
            <Button
              :label="
                expanded.has(group.id)
                  ? 'نمایش کمتر'
                  : `نمایش همه (${numberFormat(group.tags.length)})`
              "
              link
              size="small"
              class="!px-1.5 !pt-1 !pb-0 !text-xs !font-medium !text-nimoura-primary"
              @click="toggleExpanded(group.id)"
            />
          </li>
        </ul>
      </AccordionContent>
    </AccordionPanel>
  </Accordion>
</template>

<script setup lang="ts">
import type { FacetGroup } from '@nimoura/shared-types';

const props = defineProps<{ groups: FacetGroup[]; selected: number[] }>();
const emit = defineEmits<{ toggle: [tagId: number] }>();

const LIMIT = 6;
const expanded = ref<Set<number>>(new Set());
const openGroupIds = ref<string[]>([]);
const initialized = ref(false);

watch(
  () => props.groups,
  (groups) => {
    if (!initialized.value && groups.length > 0) {
      openGroupIds.value = [String(groups[0]!.id)];
      initialized.value = true;
    }
  },
  { immediate: true },
);

const selectedIn = (group: FacetGroup) =>
  group.tags.filter((t) => props.selected.includes(t.id)).length;

// always show selected tags, even beyond the first LIMIT
const visibleTags = (group: FacetGroup) =>
  expanded.value.has(group.id)
    ? group.tags
    : group.tags.filter((t, i) => i < LIMIT || props.selected.includes(t.id));

function toggleExpanded(id: number) {
  const next = new Set(expanded.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expanded.value = next;
}
</script>
