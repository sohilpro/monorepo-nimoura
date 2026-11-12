<template>
  <Drawer
    :visible="visible"
    position="bottom"
    modal
    dismissable
    :show-close-icon="false"
    :pt="{
      root: {
        class:
          '!h-auto !max-h-[85vh] !rounded-t-3xl !border-t !border-nimoura-text-100 !bg-white',
      },
      header: {
        class: '!border-b !border-nimoura-text-100 !px-4 !py-3',
      },
      content: {
        class: '!px-4 !py-0 sm:!px-5 scrollbar-hide',
      },
      footer: {
        class: '!border-t !border-nimoura-text-100 !bg-white !px-4 !py-3 sm:!px-5',
      },
    }"
    @update:visible="onVisibleChange"
  >
    <template #header>
      <div class="flex w-full items-center justify-between">
        <p class="font-vazir text-sm font-semibold text-nimoura-text-800">
          فیلترها
        </p>

        <Button
          icon="pi pi-times"
          text
          rounded
          size="small"
          severity="secondary"
          aria-label="بستن"
          class="!text-nimoura-text-400 hover:!bg-nimoura-primary/10 hover:!text-nimoura-primary"
          @click="handleClose"
        />
      </div>
    </template>

    <div>
      <!-- AVAILABILITY -->
      <div
        class="flex items-center justify-between border-b border-nimoura-text-100 py-4"
      >
        <label
          for="available-products-toggle-m"
          class="cursor-pointer text-sm font-medium text-nimoura-text-700"
        >
          فقط کالاهای موجود
        </label>

        <ToggleSwitch
          v-model="showAvailableOnly"
          input-id="available-products-toggle-m"
          class="nimoura-toggle"
          :pt="{
            slider: {
              class: showAvailableOnly ? 'bg-nimoura-primary! ' : '',
            },
          }"
        />
      </div>

      <!-- ON SALE -->
      <div
        class="flex items-center justify-between border-b border-nimoura-text-100 py-4"
      >
        <label
          for="on-sale-toggle-m"
          class="cursor-pointer text-sm font-medium text-nimoura-text-700"
        >
          فقط تخفیف‌دارها
          <span
            v-if="facets?.counts?.onSale"
            class="text-[11px] font-normal text-nimoura-text-400"
          >
            ({{ numberFormat(facets.counts.onSale) }})
          </span>
        </label>

        <ToggleSwitch
          v-model="showOnSale"
          input-id="on-sale-toggle-m"
          class="nimoura-toggle"
          :pt="{ slider: { class: showOnSale ? 'bg-nimoura-primary! ' : '' } }"
        />
      </div>

      <!-- TAG FILTERS -->
      <div
        v-if="facetsPending && !facets?.groups?.length"
        class="space-y-3 border-b border-nimoura-text-100 py-4"
      >
        <div v-for="g in 2" :key="g" class="space-y-2">
          <Skeleton width="5rem" height="0.9rem" border-radius="0.375rem" />
          <div v-for="t in 3" :key="t" class="flex items-center gap-2.5">
            <Skeleton width="1.1rem" height="1.1rem" border-radius="0.375rem" />
            <Skeleton width="60%" height="0.8rem" border-radius="0.375rem" />
          </div>
        </div>
      </div>
      <div
        v-else-if="facets?.groups?.length"
        class="border-b border-nimoura-text-100"
      >
        <CategoriesUtilsFacetGroups
          :groups="facets.groups"
          :selected="draftTags"
          @toggle="toggleDraftTag"
        />
      </div>

      <!-- PRICE RANGE -->
      <div class="py-5">
        <div class="mb-5 flex items-center justify-between">
          <p class="text-sm font-semibold text-nimoura-text-800">
            محدوده قیمت
          </p>

          <Tag
            value="تومان"
            rounded
            class="!bg-nimoura-primary/10 !px-2.5 !py-1 !text-[11px] !font-medium !text-nimoura-primary"
          />
        </div>

        <!-- SLIDER -->
        <Slider
          v-model="priceRange"
          range
          :min="MIN_PRICE"
          :max="maxPrice"
          :step="10000"
          class="nimoura-slider !mx-1"
        />

        <!-- PRICE VALUES -->
        <div class="mt-5 flex items-center justify-between gap-3">
          <!-- MIN -->
          <div
            class="flex-1 rounded-xl border border-nimoura-text-200 bg-nimoura-base/40 px-3 py-2.5 text-center transition-colors focus-within:border-nimoura-primary"
          >
            <span class="block text-[10px] text-nimoura-text-400">
              حداقل
            </span>

            <span
              class="mt-0.5 block text-xs font-semibold tabular-nums text-nimoura-text-800"
            >
              {{ numberFormat(priceRange[0]) }}
            </span>
          </div>

          <span class="shrink-0 text-nimoura-text-300"> — </span>

          <!-- MAX -->
          <div
            class="flex-1 rounded-xl border border-nimoura-text-200 bg-nimoura-base/40 px-3 py-2.5 text-center transition-colors focus-within:border-nimoura-primary"
          >
            <span class="block text-[10px] text-nimoura-text-400">
              حداکثر
            </span>

            <span
              class="mt-0.5 block text-xs font-semibold tabular-nums text-nimoura-text-800"
            >
              {{ numberFormat(priceRange[1]) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div
        class="flex w-full items-center gap-3"
        style="padding-bottom: max(env(safe-area-inset-bottom), 4px)"
      >
        <Button
          label="حذف فیلترها"
          outlined
          severity="secondary"
          class="!shrink-0 !rounded-xl !border-nimoura-text-200 !px-4 !py-3 !text-sm !font-medium !text-nimoura-text-600 hover:!border-nimoura-primary/40 hover:!bg-nimoura-primary/5 hover:!text-nimoura-primary"
          @click="handleClearFilters"
        />

        <Button
          label="اعمال فیلتر"
          class="!w-full !rounded-xl !border-nimoura-primary !bg-nimoura-primary !py-3 !text-sm !font-semibold !text-white"
          @click="handleApply"
        />
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import type { ProductFacets } from '@nimoura/shared-types';

const props = defineProps<{
  visible: boolean;
  close: () => void;
  clearFilters: () => void;
  facets?: ProductFacets | null;
  facetsPending?: boolean;
}>();

const route = useRoute();
const router = useRouter();

const MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 5000000;

const maxPrice = computed(() => {
  const highest = props.facets?.price?.max ?? 0;
  return Math.max(DEFAULT_MAX_PRICE, Math.ceil(highest / 100000) * 100000);
});

const showAvailableOnly = ref(route.query.isAvailable === "true");
const showOnSale = ref(route.query.onSale === "true");
// تگ‌ها تا زدن «اعمال فیلتر» فقط پیش‌نویس هستند
const draftTags = ref<number[]>(parseIdList(route.query.tags));

const priceRange = ref<[number, number]>([
  Number(route.query.minPrice) || MIN_PRICE,
  Number(route.query.maxPrice) || maxPrice.value,
]);

function toggleDraftTag(id: number) {
  draftTags.value = draftTags.value.includes(id)
    ? draftTags.value.filter((t) => t !== id)
    : [...draftTags.value, id];
}

/**
 * Sync state when sheet opens
 */
watch(
  () => props.visible,
  (val) => {
    if (val) {
      showAvailableOnly.value = route.query.isAvailable === "true";
      showOnSale.value = route.query.onSale === "true";
      draftTags.value = parseIdList(route.query.tags);

      priceRange.value = [
        Number(route.query.minPrice) || MIN_PRICE,
        Number(route.query.maxPrice) || maxPrice.value,
      ];
    }
  },
  {
    immediate: true,
  },
);

function handleApply() {
  const hasPriceChanged =
    priceRange.value[0] > MIN_PRICE ||
    priceRange.value[1] < maxPrice.value ||
    route.query.minPrice !== undefined ||
    route.query.maxPrice !== undefined;

  router.push({
    query: {
      ...route.query,
      isAvailable: showAvailableOnly.value ? "true" : undefined,
      onSale: showOnSale.value ? "true" : undefined,
      tags: draftTags.value.length ? draftTags.value.join(",") : undefined,
      minPrice: hasPriceChanged ? priceRange.value[0] : undefined,
      maxPrice: hasPriceChanged ? priceRange.value[1] : undefined,
      page: undefined,
    },
  });

  handleClose();
}

function handleClearFilters() {
  showAvailableOnly.value = false;
  showOnSale.value = false;
  draftTags.value = [];
  priceRange.value = [MIN_PRICE, maxPrice.value];

  props.clearFilters();

  handleClose();
}

function handleClose() {
  props.close();
}

function onVisibleChange(nextVisible: boolean) {
  if (!nextVisible) handleClose();
}
</script>

<style scoped>
/* -------------------------------- */
/* PrimeVue Slider */
/* -------------------------------- */

:deep(.nimoura-slider .p-slider-range) {
  background: var(--color-nimoura-primary);
}

:deep(.nimoura-slider .p-slider-handle) {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-nimoura-primary);
  background: white;
  box-shadow: 0 3px 10px rgb(183 110 121 / 0.22);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

:deep(.nimoura-slider .p-slider-handle:hover) {
  box-shadow: 0 4px 14px rgb(183 110 121 / 0.3);
}

:deep(.nimoura-slider .p-slider-handle:focus) {
  box-shadow:
    0 0 0 4px rgb(183 110 121 / 0.12),
    0 4px 14px rgb(183 110 121 / 0.2);
}

:deep(.nimoura-slider .p-slider-track) {
  background: var(--color-nimoura-text-100);
}
</style>
