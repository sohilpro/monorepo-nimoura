<template>
  <div v-if="chips.length" class="mb-3 flex flex-wrap items-center gap-2" aria-label="فیلترهای فعال">
    <button
      v-for="chip in chips"
      :key="chip.key"
      type="button"
      class="inline-flex items-center gap-1.5 rounded-full border border-nimoura-primary/25 bg-nimoura-primary/5 px-3 py-1 text-xs text-nimoura-text-700 transition hover:bg-nimoura-primary/10"
      :title="`حذف «${chip.label}»`"
      @click="chip.remove()"
    >
      {{ chip.label }}
      <i class="pi pi-times text-[9px] text-nimoura-primary" />
    </button>

    <button
      v-if="chips.length > 1"
      type="button"
      class="px-1 text-xs font-medium text-nimoura-primary hover:underline"
      @click="clearFilters()"
    >
      حذف همه
    </button>
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
