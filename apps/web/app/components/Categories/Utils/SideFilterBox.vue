<template>
  <div
    class="hidden h-fit shrink-0 flex-col gap-y-4 rounded-2xl border border-nimoura-text-100 bg-white py-4 shadow-[0_4px_20px_rgba(39,33,33,0.04)] lg:sticky lg:top-5 lg:flex lg:w-1/4"
  >
    <!-- TITLE -->
    <div class="flex w-full items-center justify-between px-3 xl:px-4">
      <p
        class="font-vazir text-base font-semibold text-nimoura-text-800 xl:text-lg"
      >
        فیلترها
      </p>

      <Button
        label="حذف فیلترها"
        link
        class="!p-0 !text-xs !font-medium !text-nimoura-primary hover:!text-[#a9606b] xl:!text-sm"
        @click="clearFilters"
      />
    </div>

    <!-- FILTERS -->
    <div class="w-full divide-y divide-nimoura-text-100">
      <!-- AVAILABILITY -->
      <div class="flex items-center justify-between px-3 py-3.5 xl:px-4">
        <label
          for="available-products-toggle"
          class="cursor-pointer text-sm font-medium text-nimoura-text-700"
        >
          فقط کالاهای موجود
        </label>

        <ToggleSwitch
          v-model="showAvailableOnly"
          input-id="available-products-toggle"
          :pt="{
            slider: {
              class: showAvailableOnly ? 'bg-nimoura-primary! ' : '',
            },
          }"
        />
      </div>

      <!-- ON SALE -->
      <div class="flex items-center justify-between gap-2 px-3 py-3.5 xl:px-4">
        <label
          for="on-sale-toggle"
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
          input-id="on-sale-toggle"
          :pt="{ slider: { class: showOnSale ? 'bg-nimoura-primary! ' : '' } }"
        />
      </div>

      <!-- TAG FILTERS (skin type, hair type, benefits, ...) -->
      <div v-if="facets?.groups?.length" class="px-3 xl:px-4">
        <CategoriesUtilsFacetGroups
          :groups="facets.groups"
          :selected="selectedTagIds"
          @toggle="toggleTag"
        />
      </div>

      <!-- PRICE RANGE -->
      <Accordion :value="['0']" multiple class="!border-0">
        <AccordionPanel value="0" class="!border-0">
          <!-- HEADER -->
          <AccordionHeader
            class="!bg-transparent !px-3 !py-3.5 !text-sm !font-semibold !text-nimoura-text-800 !shadow-none hover:!bg-nimoura-primary/5 xl:!px-4"
          >
            محدوده قیمت
          </AccordionHeader>

          <!-- CONTENT -->
          <AccordionContent
            :pt="{
              content: '!bg-transparent !px-3 !pb-4 xl:!px-4',
            }"
          >
            <div class="flex flex-col gap-4 pt-1">
              <!-- SLIDER -->
              <Slider
                :key="reset"
                v-model="priceRange"
                range
                :min="MIN_PRICE"
                :max="maxPrice"
                :step="10000"
                class="nimoura-slider !mx-1"
                @slideend="emitPriceUpdate"
              />

              <!-- PRICE VALUES -->
              <div class="flex items-center justify-between gap-2 text-xs">
                <!-- MIN -->
                <span
                  class="rounded-lg border border-nimoura-text-100 bg-nimoura-base px-2.5 py-1.5 font-medium tabular-nums text-nimoura-text-700"
                >
                  {{ numberFormat(priceRange[0]) }}
                </span>

                <span class="text-nimoura-text-300"> تا </span>

                <!-- MAX -->
                <span
                  class="rounded-lg border border-nimoura-text-100 bg-nimoura-base px-2.5 py-1.5 font-medium tabular-nums text-nimoura-text-700"
                >
                  {{ numberFormat(priceRange[1]) }}
                </span>
              </div>

              <!-- CURRENCY -->
              <div
                class="flex justify-between text-[10px] text-nimoura-text-400"
              >
                <span>تومان</span>
                <span>تومان</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductFacets } from '@nimoura/shared-types';

const props = defineProps<{
  clearFilters: any;
  facets?: ProductFacets | null;
}>();
const { clearFilters } = props;

const { selectedTagIds, toggleTag, setFlag } = useProductFilters();

const route = useRoute();
const router = useRouter();

const reset = ref(0);

const MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 5000000;

// slider upper bound follows the most expensive product of the current category
const maxPrice = computed(() => {
  const highest = props.facets?.price?.max ?? 0;
  return Math.max(DEFAULT_MAX_PRICE, Math.ceil(highest / 100000) * 100000);
});

const priceRange = ref<[number, number]>([
  Number(route.query.minPrice) || MIN_PRICE,
  Number(route.query.maxPrice) || maxPrice.value,
]);

const showAvailableOnly = ref(route.query.isAvailable === "true");
const showOnSale = ref(route.query.onSale === "true");

/**
 * Update price filter
 */
function emitPriceUpdate() {
  router.push({
    query: {
      ...route.query,
      minPrice: priceRange.value[0],
      maxPrice: priceRange.value[1],
    },
  });
}

/**
 * Update availability filter
 */
watch(showAvailableOnly, (newValue) => {
  router.push({
    query: {
      ...route.query,
      isAvailable: newValue ? "true" : undefined,
    },
  });
});

watch(showOnSale, (value) => {
  if (value !== (route.query.onSale === "true")) setFlag("onSale", value);
});

/**
 * Sync filters with URL
 */
watch(
  route,
  (newRoute) => {
    showAvailableOnly.value = newRoute.query.isAvailable === "true";
    showOnSale.value = newRoute.query.onSale === "true";

    priceRange.value = [
      Number(newRoute.query.minPrice) || MIN_PRICE,
      Number(newRoute.query.maxPrice) || maxPrice.value,
    ];

    reset.value += 1;
  },
  {
    immediate: true,
  },
);
</script>

<style scoped>
/* ========================================= */
/* PrimeVue Slider */
/* ========================================= */

:deep(.nimoura-slider .p-slider-range) {
  background: #b76e79;
}

:deep(.nimoura-slider .p-slider-track) {
  background: #e9e6e6;
}

:deep(.nimoura-slider .p-slider-handle) {
  width: 18px;
  height: 18px;

  border: 2px solid #b76e79;
  background: #ffffff;

  box-shadow: 0 3px 10px rgba(183, 110, 121, 0.2);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

:deep(.nimoura-slider .p-slider-handle:hover) {
  box-shadow: 0 4px 14px rgba(183, 110, 121, 0.3);
}

:deep(.nimoura-slider .p-slider-handle:focus) {
  box-shadow:
    0 0 0 4px rgba(183, 110, 121, 0.12),
    0 4px 14px rgba(183, 110, 121, 0.2);
}

/* ========================================= */
/* PrimeVue Accordion */
/* ========================================= */

:deep(.p-accordionpanel) {
  border: 0 !important;
}

:deep(.p-accordionheader) {
  border: 0 !important;
}

:deep(.p-accordioncontent-content) {
  border: 0 !important;
}

/* ========================================= */
/* Scrollbar */
/* ========================================= */

::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cfc9c9;
  border-radius: 999px;
}

::-webkit-scrollbar-thumb:hover {
  background: #b76e79;
}
</style>
