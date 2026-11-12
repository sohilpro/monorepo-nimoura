<template>
  <div v-if="chips.length" class="mb-3 flex flex-wrap items-center gap-2" aria-label="فیلترهای فعال">
    <Chip
      v-for="chip in chips"
      :key="chip.key"
      :label="chip.label"
      removable
      class="!rounded-full !border !border-nimoura-primary/25 !bg-nimoura-primary/5 !px-3 !py-1 !text-xs !text-nimoura-text-700 transition hover:!bg-nimoura-primary/10"
      :pt="{
        label: { class: '!leading-4' },
        removeIcon: { class: '!size-3.5 !text-nimoura-primary cursor-pointer' },
      }"
      @remove="chip.remove()"
    />

    <Button
      v-if="chips.length > 1"
      label="حذف همه"
      link
      size="small"
      class="!px-1 !py-0.5 !text-xs !font-medium !text-nimoura-primary"
      @click="clearFilters()"
    />
  </div>
</template>

<script setup lang="ts">
import type { FacetGroup } from '@nimoura/shared-types';

const props = defineProps<{ groups: FacetGroup[]; clearFilters: () => void }>();

const { selectedTagIds, onSale, inStock, hasPriceFilter, toggleTag, setFlag, clearPrice } = useProductFilters();
const route = useRoute();

const tagName = computed(() => {
  const map = new Map<number, string>();
  for (const g of props.groups) for (const t of g.tags) map.set(t.id, `${g.name}: ${t.name}`);
  return map;
});

const chips = computed(() => {
  const list: Array<{ key: string; label: string; remove: () => void }> = [];

  for (const id of selectedTagIds.value) {
    // the label appears once the facets have loaded
    const label = tagName.value.get(id);
    if (label) list.push({ key: `tag-${id}`, label, remove: () => toggleTag(id) });
  }
  if (onSale.value) list.push({ key: 'sale', label: 'فقط تخفیف‌دارها', remove: () => setFlag('onSale', false) });
  if (inStock.value) list.push({ key: 'stock', label: 'فقط کالاهای موجود', remove: () => setFlag('isAvailable', false) });
  if (hasPriceFilter.value) {
    const min = Number(route.query.minPrice) || 0;
    const max = Number(route.query.maxPrice);
    list.push({
      key: 'price',
      label: `قیمت: ${numberFormat(min)}${max ? ` تا ${numberFormat(max)}` : ' به بالا'} تومان`,
      remove: clearPrice,
    });
  }
  return list;
});
</script>
